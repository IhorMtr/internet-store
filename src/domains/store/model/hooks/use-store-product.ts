'use client';

import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/domains/store/api';
import { storeQueryKeys } from '@/domains/store/lib/store-query-keys';

// ========== Hooks ==========

export function useStoreProductQuery(productId: number | null) {
  return useQuery({
    queryKey: productId ? storeQueryKeys.product(productId) : ['store', 'products', 'empty'],
    queryFn: () => storeApi.getProduct(productId as number),
    enabled: Boolean(productId),
  });
}
