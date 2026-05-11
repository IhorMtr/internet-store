'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/domains/admin/api/admin.api';
import { adminQueryKeys } from '@/domains/admin/lib/admin-query-keys';
import type { CategoryInput } from '@/domains/admin/model/types/admin.types';

// ========== Hooks ==========
export function useAdminCategoriesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.categories,
    queryFn: adminApi.getCategories,
  });
}

export function useAdminCategoryQuery(categoryId: number | null) {
  return useQuery({
    queryKey: categoryId ? adminQueryKeys.category(categoryId) : ['admin', 'categories', 'empty'],
    queryFn: () => adminApi.getCategoryById(categoryId as number),
    enabled: Boolean(categoryId),
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryInput) => adminApi.createCategory(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.summary });
    },
  });
}

export function useUpdateCategoryMutation(categoryId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<CategoryInput>) => adminApi.updateCategory(categoryId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.category(categoryId) });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) => adminApi.deleteCategory(categoryId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.summary });
    },
  });
}
