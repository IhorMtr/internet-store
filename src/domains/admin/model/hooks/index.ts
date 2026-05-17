// ========== Exports ==========
export { adminQueryKeys } from '@/domains/admin/lib/admin-query-keys';
export { useAdminSummaryQuery } from '@/domains/admin/model/hooks/use-admin-summary-query';

export {
  useAdminCategoriesQuery,
  useAdminCategoryQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/domains/admin/model/hooks/use-admin-categories';

export {
  useAdminProductsQuery,
  useAdminProductQuery,
  useCreateProductMutation,
  useDeleteProductImageMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useUpdateProductMutation,
} from '@/domains/admin/model/hooks/use-admin-products';

export {
  useAdminSuppliersQuery,
  useAdminSupplierQuery,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useUpdateSupplierMutation,
} from '@/domains/admin/model/hooks/use-admin-suppliers';

export {
  useAdminDeliveriesQuery,
  useAdminDeliveryDetailsQuery,
  useCreateDeliveryMutation,
} from '@/domains/admin/model/hooks/use-admin-deliveries';

export {
  useAdminOrdersQuery,
  useAdminOrderDetailsQuery,
  useCreateShipmentMutation,
  useRegisterPaymentMutation,
  useUpdateShipmentMutation,
} from '@/domains/admin/model/hooks/use-admin-orders';

export {
  useAdminSoldProductsByDateQuery,
  useAdminTopCategoriesByPeriodQuery,
} from '@/domains/admin/model/hooks/use-admin-reports';
