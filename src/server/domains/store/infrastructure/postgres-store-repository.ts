import type { StoreRepository } from '@/server/domains/store/application/store-ports';
import { postgresAdminCatalogRepository } from '@/server/domains/store/infrastructure/postgres/store-admin-catalog-repository';
import { postgresAdminDeliveryRepository } from '@/server/domains/store/infrastructure/postgres/store-admin-delivery-repository';
import { postgresAdminOrderRepository } from '@/server/domains/store/infrastructure/postgres/store-admin-order-repository';
import { postgresReportRepository } from '@/server/domains/store/infrastructure/postgres/store-report-repository';
import { postgresUserCatalogRepository } from '@/server/domains/store/infrastructure/postgres/store-user-catalog-repository';
import { postgresUserOrderRepository } from '@/server/domains/store/infrastructure/postgres/store-user-order-repository';

// ===================== Repository =====================

export const postgresStoreRepository: StoreRepository = {
  // ===================== Admin Catalog Methods =====================
  ...postgresAdminCatalogRepository,

  // ===================== Admin Delivery Methods =====================
  ...postgresAdminDeliveryRepository,

  // ===================== Admin Order Methods =====================
  ...postgresAdminOrderRepository,

  // ===================== User Catalog Methods =====================
  ...postgresUserCatalogRepository,

  // ===================== User Order Methods =====================
  ...postgresUserOrderRepository,

  // ===================== Report Methods =====================
  ...postgresReportRepository,
};
