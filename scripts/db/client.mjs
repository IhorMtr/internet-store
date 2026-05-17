import pg from 'pg';

const { Client } = pg;

// ========== Client ==========
export function createPgClient(connectionString) {
  return new Client({ connectionString });
}
