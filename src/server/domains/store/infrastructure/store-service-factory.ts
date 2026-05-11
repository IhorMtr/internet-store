import { createStoreAdminService } from '@/server/domains/store/application/store-admin-service';
import { postgresStoreRepository } from '@/server/domains/store/infrastructure/postgres-store-repository';

// ===================== SERVICES =====================
export const storeAdminService = createStoreAdminService({
  repository: postgresStoreRepository,
});
