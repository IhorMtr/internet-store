import type { StoreProductsFilters } from '@/domains/store/model/types';

// ========== Helpers ==========

function buildProductsFiltersKey(filters: StoreProductsFilters = {}) {
  return {
    search: filters.search ?? null,
    categoryId: filters.categoryId ?? null,
  };
}

// ========== Exports ==========

export const storeQueryKeys = {
  categories: ['store', 'categories'] as const,
  products: (filters: StoreProductsFilters = {}) => ['store', 'products', buildProductsFiltersKey(filters)] as const,
  product: (productId: number) => ['store', 'products', productId] as const,
  orders: ['store', 'orders'] as const,
  order: (orderId: number) => ['store', 'orders', orderId] as const,
};
