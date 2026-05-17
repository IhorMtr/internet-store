import { storeError } from '@/server/domains/store/domain/store-error';
import type { DeliveryDetails, StoreRepository } from '@/server/domains/store/application/store-ports';
import type { CreateDeliveryInput } from '@/server/domains/store/domain/store-models';
import { postgresDb } from '@/server/shared/db/postgres-pool';
import { mapDelivery, mapDeliveryItem } from '@/server/domains/store/infrastructure/postgres/store-mappers';
import type { DeliveryItemRow, DeliveryRow } from '@/server/domains/store/infrastructure/postgres/store-row-types';
import { isRaisedException } from '@/server/domains/store/infrastructure/postgres/store-sql-errors';

// ===================== Delivery Methods =====================

export const postgresAdminDeliveryRepository: Pick<
  StoreRepository,
  'listDeliveries' | 'createDelivery' | 'getDeliveryById'
> = {
  async listDeliveries() {
    const result = await postgresDb.query<DeliveryRow>(
      `
        select
          d.delivery_id,
          d.supplier_id,
          s.name as supplier_name,
          d.delivery_date,
          d.invoice_number
        from public.deliveries as d
        inner join public.suppliers as s
          on s.supplier_id = d.supplier_id
        order by d.delivery_date desc, d.delivery_id desc
      `
    );

    return result.rows.map(mapDelivery);
  },

  async createDelivery(input: CreateDeliveryInput) {
    try {
      const result = await postgresDb.query<{ delivery_id: number }>(
        `
          select public.pr_register_delivery($1, $2, $3, $4::jsonb) as delivery_id
        `,
        [
          input.supplierId,
          input.deliveryDate,
          input.invoiceNumber,
          JSON.stringify(
            input.items.map((item: CreateDeliveryInput['items'][number]) => ({
              product_id: item.productId,
              quantity: item.quantity,
              supply_price: item.supplyPrice,
            }))
          ),
        ]
      );

      return result.rows[0].delivery_id;
    } catch (error) {
      if (isRaisedException(error)) {
        throw storeError.create('BAD_REQUEST', 'store.deliveryCreateFailed', 400);
      }

      throw error;
    }
  },

  async getDeliveryById(deliveryId: number): Promise<DeliveryDetails | null> {
    const deliveryResult = await postgresDb.query<DeliveryRow>(
      `
        select
          d.delivery_id,
          d.supplier_id,
          s.name as supplier_name,
          d.delivery_date,
          d.invoice_number
        from public.deliveries as d
        inner join public.suppliers as s
          on s.supplier_id = d.supplier_id
        where d.delivery_id = $1
        limit 1
      `,
      [deliveryId]
    );

    const deliveryRow = deliveryResult.rows[0];

    if (!deliveryRow) {
      return null;
    }

    const itemsResult = await postgresDb.query<DeliveryItemRow>(
      `
        select
          si.delivery_id,
          si.product_id,
          p.name as product_name,
          si.quantity,
          si.supply_price
        from public.supply_item as si
        inner join public.products as p
          on p.product_id = si.product_id
        where si.delivery_id = $1
        order by si.product_id asc
      `,
      [deliveryId]
    );

    return {
      delivery: mapDelivery(deliveryRow),
      items: itemsResult.rows.map(mapDeliveryItem),
    };
  },
};
