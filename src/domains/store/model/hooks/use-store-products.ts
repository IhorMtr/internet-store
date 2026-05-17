'use client';

import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/domains/store/api';
import { storeQueryKeys } from '@/domains/store/lib/store-query-keys';
import type { StoreProductsFilters } from '@/domains/store/model/types';

// ========== Hooks ==========

export function useStoreProductsQuery(filters: StoreProductsFilters = {}) {
  return useQuery({
    queryKey: storeQueryKeys.products(filters),
    queryFn: () => storeApi.getProducts(filters),
  });
}
