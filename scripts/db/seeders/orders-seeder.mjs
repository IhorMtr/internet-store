import { orderSeed, orderStatusSeed } from '../seed-data/orders.mjs';

// ========== Helpers ==========
async function createOrder(client, order) {
  const result = await client.query(
    `
      select public.pr_create_order($1, $2, $3::jsonb, $4) as order_id
    `,
    [order.customerId, order.orderDate, JSON.stringify(order.items), order.paymentMethod]
  );

  return result.rows[0].order_id;
}

// ========== Seeder ==========
export async function seedOrders(client, customerIds, productIds) {
  const orderIds = new Map();

  for (const rawOrder of orderSeed) {
    const order = {
      customerId: customerIds.get(rawOrder.customerKey),
      orderDate: rawOrder.orderDate,
      paymentMethod: rawOrder.paymentMethod,
      items: rawOrder.items.map(item => ({ product_id: productIds.get(item.productName), quantity: item.quantity })),
    };

    const orderId = await createOrder(client, order);
    orderIds.set(rawOrder.key, orderId);
  }

  for (const seededStatus of orderStatusSeed) {
    await client.query(`update public.orders set status = $1 where order_id = $2`, [
      seededStatus.status,
      orderIds.get(seededStatus.orderKey),
    ]);
  }

  return orderIds;
}
