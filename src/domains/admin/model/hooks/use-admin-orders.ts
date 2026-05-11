'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/domains/admin/api/admin.api';
import { adminQueryKeys } from '@/domains/admin/lib/admin-query-keys';
import type { OrdersFilters, PaymentInput, ShipmentInput } from '@/domains/admin/model/types/admin.types';

// ========== Hooks ==========
export function useAdminOrdersQuery(filters: OrdersFilters) {
  return useQuery({
    queryKey: adminQueryKeys.orders(filters),
    queryFn: () => adminApi.getOrders(filters),
  });
}

export function useAdminOrderDetailsQuery(orderId: number | null) {
  return useQuery({
    queryKey: orderId ? adminQueryKeys.order(orderId) : ['admin', 'orders', 'empty'],
    queryFn: () => adminApi.getOrderDetails(orderId as number),
    enabled: Boolean(orderId),
  });
}

export function useCreateShipmentMutation(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ShipmentInput) => adminApi.createShipment(orderId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.order(orderId) });
    },
  });
}

export function useUpdateShipmentMutation(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ShipmentInput) => adminApi.updateShipment(orderId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.order(orderId) });
    },
  });
}

export function useRegisterPaymentMutation(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PaymentInput) => adminApi.registerPayment(orderId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.order(orderId) });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.summary });
    },
  });
}
