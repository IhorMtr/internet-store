import { paymentSeed, shipmentSeed } from '../seed-data/orders.mjs';

// ========== Seeder ==========
export async function seedPaymentsAndShipments(client, orderIds) {
  for (const payment of paymentSeed) {
    await client.query(`call public.pr_register_payment($1, $2, $3)`, [
      orderIds.get(payment.orderKey),
      payment.paymentDate,
      payment.paymentMethod,
    ]);
  }

  for (const shipment of shipmentSeed) {
    await client.query(`select public.pr_create_shipment($1, $2, $3, $4, $5)`, [
      orderIds.get(shipment.orderKey),
      shipment.deliveryService,
      shipment.trackingNumber,
      shipment.shippingAddress,
      shipment.shipmentStatus,
    ]);
  }
}
