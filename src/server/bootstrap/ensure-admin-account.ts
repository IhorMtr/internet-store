import { bcryptPasswordService } from '@/server/domains/auth/infrastructure/bcrypt-password-service';
import { postgresAuthRepository } from '@/server/domains/auth/infrastructure/postgres-auth-repository';
import { serverEnv } from '@/server/shared/config/env';

type GlobalBootstrapState = typeof globalThis & {
  shopcoreAdminBootstrapPromise?: Promise<void>;
};

const globalBootstrapState = globalThis as GlobalBootstrapState;

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_FULL_NAME = 'ShopCore Admin';

async function ensureAdminAccountInternal(): Promise<void> {
  if (serverEnv.nodeEnv === 'production') {
    return;
  }

  const existingAdmin = await postgresAuthRepository.findUserByEmail(ADMIN_EMAIL);

  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcryptPasswordService.hash(ADMIN_PASSWORD);

  await postgresAuthRepository.createUser({
    email: ADMIN_EMAIL,
    passwordHash,
    fullName: ADMIN_FULL_NAME,
    roleName: 'admin',
  });

  console.info('[bootstrap][admin] default admin account created');
}

export function ensureAdminAccountBootstrap(): Promise<void> {
  if (!globalBootstrapState.shopcoreAdminBootstrapPromise) {
    globalBootstrapState.shopcoreAdminBootstrapPromise = ensureAdminAccountInternal().catch(error => {
      console.error('[bootstrap][admin] failed to ensure admin account', error);
      globalBootstrapState.shopcoreAdminBootstrapPromise = undefined;
    });
  }

  return globalBootstrapState.shopcoreAdminBootstrapPromise;
}
