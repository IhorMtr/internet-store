import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { serverEnv } from '@/server/shared/config/env';

// ===================== TYPES =====================
type GlobalPostgres = typeof globalThis & {
  postgresPool?: Pool;
  postgresPoolListenersAttached?: boolean;
};

// ===================== CONSTANTS =====================
const globalPostgres = globalThis as GlobalPostgres;

// ===================== SERVICES =====================
export const postgresPool =
  globalPostgres.postgresPool ??
  new Pool({
    connectionString: serverEnv.databaseUrl,
  });

if (!globalPostgres.postgresPoolListenersAttached) {
  postgresPool.on('connect', () => {
    console.info('[db][postgres] client connected');
  });

  postgresPool.on('error', error => {
    console.error('[db][postgres] unexpected error', error);
  });

  globalPostgres.postgresPoolListenersAttached = true;
}

if (serverEnv.nodeEnv !== 'production') {
  globalPostgres.postgresPool = postgresPool;
}

// ===================== EXPORTS =====================
export const postgresDb = {
  async query<T extends QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>> {
    return postgresPool.query<T>(text, values);
  },
};
