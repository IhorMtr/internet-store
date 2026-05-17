import { storeError } from '@/server/domains/store/domain/store-error';
import type { OrdersListFilters, StoreRepository } from '@/server/domains/store/application/store-ports';
import type { PaymentInput, ShipmentInput } from '@/server/domains/store/domain/store-models';
import { postgresDb, postgresPool } from '@/server/shared/db/postgres-pool';
import { mapOrderListRow, toAdminOrderDetailsRow } from '@/server/domains/store/infrastructure/postgres/store-mappers';
import type { AdminOrderListRow } from '@/server/domains/store/infrastructure/postgres/store-row-types';
import {
  asPostgresError,
  isCancelledStatus,
  isRaisedException,
  isUniqueViolation,
} from '@/server/domains/store/infrastructure/postgres/store-sql-errors';

// ===================== Admin Order Methods =====================

export const postgresAdminOrderRepository: Pick<
  StoreRepository,
  'listOrders' | 'getOrderDetails' | 'createShipment' | 'updateShipment' | 'registerPayment'
> = {
  async listOrders(filters: OrdersListFilters) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`o.status = $${values.length}`);
    }

    if (filters.customerId) {
      values.push(filters.customerId);
      conditions.push(`o.customer_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';

    const result = await postgresDb.query<AdminOrderListRow>(
      `
        select
          o.order_id,
          o.customer_id,
          c.full_name as customer_name,
          o.order_date,
          o.status,
          o.total_amount,
          p.payment_method,
          sh.shipping_status
        from public.orders as o
        inner join public.customers as c
          on c.customer_id = o.customer_id
        left join lateral (
          select payment_method
          from public.payments
          where order_id = o.order_id
          order by payment_date desc, payment_id desc
          limit 1
        ) as p on true
        left join public.shipment as sh
          on sh.order_id = o.order_id
        ${whereClause}
        order by o.order_date desc, o.order_id desc
      `,
      values
    );

    return result.rows.map(mapOrderListRow);
  },

  async getOrderDetails(orderId: number) {
    const result = await postgresDb.query<Record<string, unknown>>(
      `
        select *
        from public.v_order_details
        where order_id = $1
      `,
      [orderId]
    );

    return result.rows.map(toAdminOrderDetailsRow);
  },

  async createShipment(orderId: number, input: ShipmentInput) {
    try {
      const result = await postgresDb.query<{ shipment_id: number }>(
        `
          select public.pr_create_shipment($1, $2, $3, $4, $5) as shipment_id
        `,
        [orderId, input.shippingService, input.trackingNumber, input.shippingAddress, input.shippingStatus]
      );

      return result.rows[0].shipment_id;
    } catch (error) {
      const postgresError = asPostgresError(error);

      if (isRaisedException(error)) {
        if (postgresError.message.includes('already exists')) {
          throw storeError.create('CONFLICT', 'store.shipmentAlreadyExists', 409);
        }

        if (postgresError.message.includes('does not exist')) {
          throw storeError.create('NOT_FOUND', 'store.orderNotFound', 404);
        }
      }

      throw error;
    }
  },

  async updateShipment(orderId: number, input: ShipmentInput) {
    const result = await postgresDb.query(
      `
        update public.shipment
        set
          shipping_service = $2,
          tracking_number = $3,
          shipping_address = $4,
          shipping_status = $5
        where order_id = $1
      `,
      [orderId, input.shippingService, input.trackingNumber, input.shippingAddress, input.shippingStatus]
    );

    return (result.rowCount ?? 0) > 0;
  },

  async registerPayment(orderId: number, input: PaymentInput) {
    const client = await postgresPool.connect();

    try {
      await client.query('begin');

      const orderResult = await client.query<{ status: string }>(
        `
          select status
          from public.orders
          where order_id = $1
          limit 1
        `,
        [orderId]
      );
      const orderRow = orderResult.rows[0];

      if (!orderRow) {
        throw storeError.create('NOT_FOUND', 'store.orderNotFound', 404);
      }

      if (isCancelledStatus(orderRow.status)) {
        throw storeError.create('CONFLICT', 'store.orderCancelledCannotPay', 409);
      }

      const existingPayment = await client.query<{ payment_id: number }>(
        `
          select payment_id
          from public.payments
          where order_id = $1
          limit 1
        `,
        [orderId]
      );

      if (existingPayment.rows[0]) {
        throw storeError.create('CONFLICT', 'store.paymentAlreadyExists', 409);
      }

      await client.query(
        `
          call public.pr_register_payment($1, current_date, $2)
        `,
        [orderId, input.paymentMethod]
      );
      const result = await client.query<{ payment_id: number }>(
        `
          select payment_id
          from public.payments
          where order_id = $1
          order by payment_id desc
          limit 1
        `,
        [orderId]
      );
      const payment = result.rows[0];

      if (!payment) {
        throw storeError.create('BAD_REQUEST', 'store.paymentRegisterFailed', 400);
      }

      await client.query('commit');

      return payment.payment_id;
    } catch (error) {
      await client.query('rollback');

      const postgresError = asPostgresError(error);

      if (storeError.is(error)) {
        throw error;
      }

      if (isRaisedException(error)) {
        if (postgresError.message.toLowerCase().includes('already')) {
          throw storeError.create('CONFLICT', 'store.paymentAlreadyExists', 409);
        }

        if (postgresError.message.toLowerCase().includes('does not exist')) {
          throw storeError.create('NOT_FOUND', 'store.orderNotFound', 404);
        }

        throw storeError.create('BAD_REQUEST', 'store.paymentRegisterFailed', 400);
      }

      if (isUniqueViolation(error)) {
        throw storeError.create('CONFLICT', 'store.paymentAlreadyExists', 409);
      }

      throw error;
    } finally {
      client.release();
    }
  },
};
