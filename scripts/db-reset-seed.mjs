import { createPgClient } from './db/client.mjs';
import { BASE_SCHEMA_FILE, ENV_FILE, MIGRATIONS_DIR } from './db/constants.mjs';
import { loadEnvFile } from './db/env.mjs';
import { applyMigrations } from './db/migrations.mjs';
import { resetSchemaOrData, restartShopCoreSequences } from './db/reset.mjs';
import { ensureResetIsAllowed } from './db/safety.mjs';
import { seedShopCoreData } from './db/seeders/shopcore-seeder.mjs';
import { printResetSummary, printTargetDatabase } from './db/summary.mjs';

async function run() {
  loadEnvFile(ENV_FILE);
  ensureResetIsAllowed();

  printTargetDatabase(process.env.DATABASE_URL);

  const client = createPgClient(process.env.DATABASE_URL);

  await client.connect();

  try {
    await resetSchemaOrData(client, BASE_SCHEMA_FILE);
    await applyMigrations(client, MIGRATIONS_DIR);
    await restartShopCoreSequences(client);

    const summary = await seedShopCoreData(client);
    printResetSummary(summary);
  } finally {
    await client.end();
  }
}

run().catch(error => {
  console.error('[db:reset-seed] failed', error);
  process.exitCode = 1;
});
