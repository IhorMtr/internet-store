const ALLOWED_LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', 'postgres', 'db', 'host.docker.internal']);

// ========== Safety ==========
export function ensureResetIsAllowed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('db:reset-seed is blocked in production environment');
  }

  if (process.env.SHOPCORE_ALLOW_DB_RESET !== 'true') {
    throw new Error('Set SHOPCORE_ALLOW_DB_RESET=true to run db:reset-seed');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const parsedDatabaseUrl = new URL(process.env.DATABASE_URL);

  if (!ALLOWED_LOCAL_HOSTS.has(parsedDatabaseUrl.hostname) && process.env.SHOPCORE_ALLOW_REMOTE_DB_RESET !== 'true') {
    throw new Error(
      `DATABASE_URL host "${parsedDatabaseUrl.hostname}" is not recognized as local. ` +
        'If this is an intentional dev environment, set SHOPCORE_ALLOW_REMOTE_DB_RESET=true.'
    );
  }
}
