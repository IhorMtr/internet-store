import { deliverySeed } from '../seed-data/deliveries.mjs';

// ========== Helpers ==========
async function createDelivery(client, delivery) {
  const result = await client.query(
    `
      select public.pr_register_delivery($1, $2, $3, $4::jsonb) as delivery_id
    `,
    [delivery.supplierId, delivery.deliveryDate, delivery.invoiceNumber, JSON.stringify(delivery.items)]
  );

  return result.rows[0].delivery_id;
}

// ========== Seeder ==========
export async function seedDeliveries(client, supplierIds, productIds) {
  const deliveryIds = [];

  for (const rawDelivery of deliverySeed) {
    const delivery = {
      supplierId: supplierIds.get(rawDelivery.supplierKey),
      deliveryDate: rawDelivery.deliveryDate,
      invoiceNumber: rawDelivery.invoiceNumber,
      items: rawDelivery.items.map(item => ({
        product_id: productIds.get(item.productName),
        quantity: item.quantity,
        supply_price: item.supply_price,
      })),
    };

    const deliveryId = await createDelivery(client, delivery);
    deliveryIds.push(deliveryId);
  }

  return deliveryIds;
}
