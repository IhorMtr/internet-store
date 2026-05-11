import type { OrdersFilters, ProductsFilters } from '@/domains/admin/model/types/admin.types';

// ========== Helpers ==========
function normalizeProductsFilters(filters: ProductsFilters) {
  return {
    search: filters.search ?? null,
    categoryId: filters.categoryId ?? null,
  };
}

function normalizeOrdersFilters(filters: OrdersFilters) {
  return {
    status: filters.status ?? null,
    customerId: filters.customerId ?? null,
  };
}

// ========== Exports ==========
export const adminQueryKeys = {
  summary: ['admin', 'summary'] as const,

  categories: ['admin', 'categories'] as const,
  category: (categoryId: number) => ['admin', 'categories', categoryId] as const,

  products: (filters: ProductsFilters = {}) => ['admin', 'products', normalizeProductsFilters(filters)] as const,
  product: (productId: number) => ['admin', 'products', productId] as const,

  suppliers: ['admin', 'suppliers'] as const,
  supplier: (supplierId: number) => ['admin', 'suppliers', supplierId] as const,

  deliveries: ['admin', 'deliveries'] as const,
  delivery: (deliveryId: number) => ['admin', 'deliveries', deliveryId] as const,

  orders: (filters: OrdersFilters = {}) => ['admin', 'orders', normalizeOrdersFilters(filters)] as const,
  order: (orderId: number) => ['admin', 'orders', orderId] as const,

  soldProductsReport: (date: string) => ['admin', 'reports', 'sold-products', date] as const,
  topCategoriesReport: (dateFrom: string, dateTo: string) =>
    ['admin', 'reports', 'top-categories', dateFrom, dateTo] as const,
};
