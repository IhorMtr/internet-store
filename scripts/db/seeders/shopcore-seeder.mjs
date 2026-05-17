import { insertCategories } from './categories-seeder.mjs';
import { insertProducts } from './products-seeder.mjs';
import { insertSuppliers } from './suppliers-seeder.mjs';
import { seedDeliveries } from './deliveries-seeder.mjs';
import { seedUserRoles, seedCustomersAndUsers } from './users-seeder.mjs';
import { seedOrders } from './orders-seeder.mjs';
import { seedPaymentsAndShipments } from './payments-shipments-seeder.mjs';

// ========== Seeder ==========
export async function seedShopCoreData(client) {
  await client.query('begin');

  try {
    await seedUserRoles(client);
    const categoryIds = await insertCategories(client);
    const productIds = await insertProducts(client, categoryIds);
    const supplierIds = await insertSuppliers(client);
    await seedDeliveries(client, supplierIds, productIds);
    const customerIds = await seedCustomersAndUsers(client);
    const orderIds = await seedOrders(client, customerIds, productIds);
    await seedPaymentsAndShipments(client, orderIds);

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }

  const summaryResult = await client.query(
    `
      select
        (select count(*)::int from public.categories) as categories_count,
        (select count(*)::int from public.products) as products_count,
        (select count(*)::int from public.suppliers) as suppliers_count,
        (select count(*)::int from public.deliveries) as deliveries_count,
        (select count(*)::int from public.customers) as customers_count,
        (select count(*)::int from public.orders) as orders_count
    `
  );

  return summaryResult.rows[0];
}
