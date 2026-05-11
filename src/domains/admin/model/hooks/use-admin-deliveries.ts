'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/domains/admin/api/admin.api';
import { adminQueryKeys } from '@/domains/admin/lib/admin-query-keys';
import type { CreateDeliveryInput } from '@/domains/admin/model/types/admin.types';

// ========== Hooks ==========
export function useAdminDeliveriesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.deliveries,
    queryFn: adminApi.getDeliveries,
  });
}

export function useAdminDeliveryDetailsQuery(deliveryId: number | null) {
  return useQuery({
    queryKey: deliveryId ? adminQueryKeys.delivery(deliveryId) : ['admin', 'deliveries', 'empty'],
    queryFn: () => adminApi.getDeliveryById(deliveryId as number),
    enabled: Boolean(deliveryId),
  });
}

export function useCreateDeliveryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDeliveryInput) => adminApi.createDelivery(input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.deliveries });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.summary });
    },
  });
}
