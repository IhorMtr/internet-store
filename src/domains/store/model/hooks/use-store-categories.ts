'use client';

import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/domains/store/api';
import { storeQueryKeys } from '@/domains/store/lib/store-query-keys';

// ========== Hooks ==========

export function useStoreCategoriesQuery() {
  return useQuery({
    queryKey: storeQueryKeys.categories,
    queryFn: storeApi.getCategories,
  });
}
