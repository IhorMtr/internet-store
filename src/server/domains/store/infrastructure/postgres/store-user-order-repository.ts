import { storeError } from '@/server/domains/store/domain/store-error';
import type {
  CreateUserOrderInput,
  StoreRepository,
  UserPaymentInput,
} from '@/server/domains/store/application/store-ports';
import { postgresDb, postgresPool } from '@/server/shared/db/postgres-pool';
import {
  mapUserOrderDetails,
  mapUserOrderListRow,
  mapUserPayment,
} from '@/server/domains/store/infrastructure/postgres/store-mappers';
import type {
  OrderPaymentSourceRow,
  UserOrderDetailsRow,
  UserOrderListRow,
  UserPaymentRow,
} from '@/server/domains/store/infrastructure/postgres/store-row-types';
import {
  asPostgresError,
  createOrderStoreError,
  isCancelledStatus,
  isForeignKeyError,
  isPaidStatus,
  isRaisedException,
  isUniqueViolation,
} from '@/server/domains/store/infrastructure/postgres/store-sql-errors';

// ===================== User Order Methods =====================

export const postgresUserOrderRepository: Pick<
  StoreRepository,
  | 'createUserOrder'
  | 'listCustomerOrders'
  | 'getCustomerOrderDetails'
  | 'registerCustomerPayment'
  | 'cancelCustomerOrder'
> = {
  async createUserOrder(customerId: number, input: CreateUserOrderInput) {
    const client = await postgresPool.connect();

    try {
      await client.query('begin');

      const result = await client.query<{ order_id: number }>(
        `
          select public.pr_create_order($1, current_date, $2::jsonb, $3) as order_id
        `,
        [
          customerId,
          JSON.stringify(
            input.items.map(item => ({
              product_id: item.productId,
              quantity: item.quantity,
            }))
          ),
          input.paymentMethod,
        ]
      );
      const orderId = result.rows[0].order_id;

      if (input.shipment) {
        await client.query(
          `
            select public.pr_create_shipment($1, $2, $3, $4, $5)
          `,
          [
            orderId,
            input.shipment.shippingService,
            input.shipment.trackingNumber,
            input.shipment.shippingAddress,
            input.shipment.shippingStatus,
          ]
        );
      }

      await client.query('commit');

      return orderId;
    } catch (error) {
      await client.query('rollback');

      if (storeError.is(error)) {
        throw error;
      }

      if (isRaisedException(error)) {
        createOrderStoreError(error);
      }

      if (isForeignKeyError(error)) {
        throw storeError.create('NOT_FOUND', 'store.productNotFound', 404);
      }

      throw error;
    } finally {
      client.release();
    }
  },

  async listCustomerOrders(customerId: number) {
    const result = await postgresDb.query<UserOrderListRow>(
      `
        select
          f.order_id,
          f.order_date,
          f.order_status,
          f.total_amount,
          coalesce(p.payment_method, o.payment_method) as payment_method,
          nullif(f.payment_status, 'No payment') as payment_status,
          nullif(f.shipping_status, 'No shipment') as shipping_status
        from public.fn_customer_orders($1) as f
        inner join public.orders as o
          on o.order_id = f.order_id
        left join lateral (
          select payment_method
          from public.payments
          where order_id = f.order_id
          order by payment_date desc, payment_id desc
          limit 1
        ) as p on true
        order by f.order_date desc, f.order_id desc
      `,
      [customerId]
    );

    return result.rows.map(mapUserOrderListRow);
  },

  async getCustomerOrderDetails(customerId: number, orderId: number) {
    const result = await postgresDb.query<UserOrderDetailsRow>(
      `
        select
          vod.order_item_id,
          vod.order_id,
          vod.order_date,
          vod.order_status,
          vod.total_amount,
          vod.customer_id,
          vod.customer_name,
          vod.phone_number,
          vod.email,
          vod.product_id,
          vod.product_name,
          p.image_url as product_image_url,
          vod.quantity,
          vod.sale_price,
          vod.item_discount,
          vod.line_amount,
          vod.payment_date,
          vod.payment_amount,
          coalesce(vod.payment_method, o.payment_method) as payment_method,
          vod.payment_status,
          vod.shipping_service,
          vod.tracking_number,
          vod.shipping_address,
          vod.shipping_status
        from public.v_order_details as vod
        inner join public.orders as o
          on o.order_id = vod.order_id
        inner join public.products as p
          on p.product_id = vod.product_id
        where vod.order_id = $1
          and vod.customer_id = $2
        order by vod.order_item_id asc
      `,
      [orderId, customerId]
    );

    return mapUserOrderDetails(result.rows);
  },

  async registerCustomerPayment(customerId: number, orderId: number, input: UserPaymentInput) {
    const client = await postgresPool.connect();

    try {
      await client.query('begin');

      const orderResult = await client.query<OrderPaymentSourceRow>(
        `
          select
            order_id,
            total_amount,
            status,
            payment_method
          from public.orders
          where order_id = $1
            and customer_id = $2
          limit 1
        `,
        [orderId, customerId]
      );

      if (!orderResult.rows[0]) {
        throw storeError.create('NOT_FOUND', 'store.orderNotFound', 404);
      }

      const order = orderResult.rows[0];

      if (isCancelledStatus(order.status)) {
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

      const paymentMethod = input.paymentMethod ?? order.payment_method;

      if (!paymentMethod) {
        throw storeError.create('BAD_REQUEST', 'store.paymentMethodMissing', 400);
      }

      await client.query(
        `
          call public.pr_register_payment($1, current_date, $2)
        `,
        [orderId, paymentMethod]
      );
      const paymentResult = await client.query<UserPaymentRow>(
        `
          select
            payment_id,
            order_id,
            payment_date,
            amount,
            payment_method,
            status
          from public.payments
          where order_id = $1
          order by payment_id desc
          limit 1
        `,
        [orderId]
      );
      const payment = paymentResult.rows[0];

      if (!payment) {
        throw storeError.create('BAD_REQUEST', 'store.paymentRegisterFailed', 400);
      }

      await client.query('commit');

      return mapUserPayment(payment);
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

  async cancelCustomerOrder(customerId: number, orderId: number) {
    const client = await postgresPool.connect();

    try {
      await client.query('begin');

      const orderResult = await client.query<{ status: string }>(
        `
          select status
          from public.orders
          where order_id = $1
            and customer_id = $2
          for update
        `,
        [orderId, customerId]
      );
      const order = orderResult.rows[0];

      if (!order) {
        throw storeError.create('NOT_FOUND', 'store.orderNotFound', 404);
      }

      if (isCancelledStatus(order.status)) {
        throw storeError.create('CONFLICT', 'store.orderAlreadyCancelled', 409);
      }

      if (isPaidStatus(order.status)) {
        throw storeError.create('CONFLICT', 'store.orderPaidCannotCancel', 409);
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
        throw storeError.create('CONFLICT', 'store.orderPaidCannotCancel', 409);
      }

      const orderItemsResult = await client.query<{ product_id: number; quantity: number }>(
        `
          select
            oi.product_id,
            oi.quantity
          from public.order_items as oi
          where oi.order_id = $1
          for update
        `,
        [orderId]
      );

      for (const item of orderItemsResult.rows) {
        await client.query(
          `
            update public.products
            set stock_quantity = stock_quantity + $2
            where product_id = $1
          `,
          [item.product_id, item.quantity]
        );
      }

      await client.query(
        `
          update public.orders
          set status = 'Cancelled'
          where order_id = $1
        `,
        [orderId]
      );

      await client.query(
        `
          update public.shipment
          set shipping_status = 'Cancelled'
          where order_id = $1
        `,
        [orderId]
      );

      await client.query('commit');
    } catch (error) {
      await client.query('rollback');

      if (storeError.is(error)) {
        throw error;
      }

      throw error;
    } finally {
      client.release();
    }
  },
};
