import fs from 'node:fs';
import { readFileSync } from 'node:fs';

// ========== Helpers ==========
function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

// ========== Reset ==========
export async function resetSchemaOrData(client, baseSchemaFilePath) {
  const hasBaseSchema = fs.existsSync(baseSchemaFilePath);

  if (!hasBaseSchema) {
    throw new Error(
      `[db:reset-seed] Required baseline schema file is missing: ${baseSchemaFilePath}. ` +
        'Reset/seed now supports baseline-only flow.'
    );
  }

  console.info('[db:reset-seed] baseline schema file detected and will be applied');
  await client.query('drop schema if exists public cascade; create schema public;');
  const sql = readFileSync(baseSchemaFilePath, 'utf8');

  if (!sql.trim()) {
    throw new Error(`[db:reset-seed] Baseline schema file is empty: ${baseSchemaFilePath}`);
  }

  await client.query(sql);
}

export async function truncateShopCoreTables(client) {
  const tableCandidates = [
    'user_sessions',
    'auth_users',
    'user_roles',
    'customers',
    'shipment',
    'payments',
    'order_items',
    'orders',
    'supply_item',
    'deliveries',
    'products',
    'categories',
    'suppliers',
  ];

  const result = await client.query(
    `
      select tablename
      from pg_tables
      where schemaname = 'public'
        and tablename = any($1::text[])
    `,
    [tableCandidates]
  );

  const existingTables = result.rows.map(row => row.tablename);

  if (existingTables.length === 0) {
    console.warn('[db:reset-seed] no known ShopCore tables found to truncate');
    return;
  }

  const truncateSql = `truncate table ${existingTables
    .map(tableName => `public.${quoteIdentifier(tableName)}`)
    .join(', ')} restart identity cascade;`;

  await client.query(truncateSql);
  console.info(`[db:reset-seed] truncated ${existingTables.length} tables`);
}

export async function restartShopCoreSequences(client) {
  const sequenceCandidates = [
    'seq_categories_id',
    'seq_customers_id',
    'seq_deliveries_id',
    'seq_order_items_id',
    'seq_orders_id',
    'seq_payments_id',
    'seq_products_id',
    'seq_shipment_id',
    'seq_suppliers_id',
    'seq_supply_item_id',
    'auth_users_user_id_seq',
  ];

  const result = await client.query(
    `
      select sequencename
      from pg_sequences
      where schemaname = 'public'
        and sequencename = any($1::text[])
    `,
    [sequenceCandidates]
  );

  for (const row of result.rows) {
    await client.query(`select setval($1::regclass, 1, false)`, [`public.${row.sequencename}`]);
  }

  if (result.rows.length > 0) {
    console.info(`[db:reset-seed] reset ${result.rows.length} sequences to start from 1`);
  }
}
