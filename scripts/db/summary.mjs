import { getAdminSeedAccount } from './seed-data/accounts.mjs';

// ========== Summary ==========
export function printTargetDatabase(databaseUrl) {
  const parsedDatabaseUrl = new URL(databaseUrl);
  const targetDatabaseName = parsedDatabaseUrl.pathname.replace(/^\//, '') || '(default)';
  console.info(`[db:reset-seed] target database host=${parsedDatabaseUrl.hostname} db=${targetDatabaseName}`);
}

export function printResetSummary(summary) {
  const adminAccount = getAdminSeedAccount();

  console.info('[db:reset-seed] done');
  console.info(
    `[db:reset-seed] summary: categories=${summary.categories_count}, products=${summary.products_count}, ` +
      `suppliers=${summary.suppliers_count}, deliveries=${summary.deliveries_count}, ` +
      `customers=${summary.customers_count}, orders=${summary.orders_count}`
  );
  console.info(`[db:reset-seed] admin account from env: ${adminAccount.email}`);
}
