'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/domains/admin/api/admin.api';
import { adminQueryKeys } from '@/domains/admin/lib/admin-query-keys';
import type { ProductInput, ProductsFilters } from '@/domains/admin/model/types/admin.types';

// ========== Hooks ==========
export function useAdminProductsQuery(filters: ProductsFilters) {
  return useQuery({
    queryKey: adminQueryKeys.products(filters),
    queryFn: () => adminApi.getProducts(filters),
  });
}

export function useAdminProductQuery(productId: number | null) {
  return useQuery({
    queryKey: productId ? adminQueryKeys.product(productId) : ['admin', 'products', 'empty'],
    queryFn: () => adminApi.getProductById(productId as number),
    enabled: Boolean(productId),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductInput) => adminApi.createProduct(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.summary });
    },
  });
}

export function useUpdateProductMutation(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<ProductInput>) => adminApi.updateProduct(productId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.product(productId) });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => adminApi.deleteProduct(productId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.summary });
    },
  });
}

export function useUploadProductImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, file }: { productId: number; file: File }) =>
      adminApi.uploadProductImage(productId, file),
    onSuccess(_response, variables) {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.product(variables.productId) });
      void queryClient.invalidateQueries({ queryKey: ['store', 'products'] });
      void queryClient.invalidateQueries({ queryKey: ['store', 'orders'] });
    },
  });
}

export function useDeleteProductImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => adminApi.deleteProductImage(productId),
    onSuccess(_response, productId) {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.product(productId) });
      void queryClient.invalidateQueries({ queryKey: ['store', 'products'] });
      void queryClient.invalidateQueries({ queryKey: ['store', 'orders'] });
    },
  });
}
