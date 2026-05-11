import { ensureAdminAccountBootstrap } from '@/server/bootstrap/ensure-admin-account';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  await ensureAdminAccountBootstrap();
}
