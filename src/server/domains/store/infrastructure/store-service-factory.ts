import { createStoreAdminService } from '@/server/domains/store/application/store-admin-service';
import { createStoreUserService } from '@/server/domains/store/application/store-user-service';
import { postgresStoreRepository } from '@/server/domains/store/infrastructure/postgres-store-repository';

// ===================== SERVICES =====================
export const storeAdminService = createStoreAdminService({
  repository: postgresStoreRepository,
});

export const storeUserService = createStoreUserService({
  repository: postgresStoreRepository,
});
