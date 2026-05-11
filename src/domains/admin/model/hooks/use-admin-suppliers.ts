'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/domains/admin/api/admin.api';
import { adminQueryKeys } from '@/domains/admin/lib/admin-query-keys';
import type { SupplierInput } from '@/domains/admin/model/types/admin.types';

// ========== Hooks ==========
export function useAdminSuppliersQuery() {
  return useQuery({
    queryKey: adminQueryKeys.suppliers,
    queryFn: adminApi.getSuppliers,
  });
}

export function useAdminSupplierQuery(supplierId: number | null) {
  return useQuery({
    queryKey: supplierId ? adminQueryKeys.supplier(supplierId) : ['admin', 'suppliers', 'empty'],
    queryFn: () => adminApi.getSupplierById(supplierId as number),
    enabled: Boolean(supplierId),
  });
}

export function useCreateSupplierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SupplierInput) => adminApi.createSupplier(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.suppliers });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.summary });
    },
  });
}

export function useUpdateSupplierMutation(supplierId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<SupplierInput>) => adminApi.updateSupplier(supplierId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.suppliers });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.supplier(supplierId) });
    },
  });
}

export function useDeleteSupplierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplierId: number) => adminApi.deleteSupplier(supplierId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.suppliers });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.summary });
    },
  });
}
