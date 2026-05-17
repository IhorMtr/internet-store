'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/domains/store/api';
import { storeQueryKeys } from '@/domains/store/lib/store-query-keys';
import type { CreateStoreOrderInput, PayStoreOrderInput } from '@/domains/store/model/types';

// ========== Hooks ==========

export function useStoreOrdersQuery() {
  return useQuery({
    queryKey: storeQueryKeys.orders,
    queryFn: storeApi.getOrders,
  });
}

export function useStoreOrderQuery(orderId: number | null) {
  return useQuery({
    queryKey: orderId ? storeQueryKeys.order(orderId) : ['store', 'orders', 'empty'],
    queryFn: () => storeApi.getOrder(orderId as number),
    enabled: Boolean(orderId),
  });
}

export function useCreateStoreOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStoreOrderInput) => storeApi.createOrder(input),
    onSuccess(response) {
      void queryClient.invalidateQueries({ queryKey: storeQueryKeys.orders });
      void queryClient.invalidateQueries({ queryKey: ['store', 'products'] });
      void queryClient.invalidateQueries({ queryKey: storeQueryKeys.order(response.data.order.orderId) });
    },
  });
}

export function usePayStoreOrderMutation(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: PayStoreOrderInput) => storeApi.payOrder(orderId, input),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: storeQueryKeys.orders });
      void queryClient.invalidateQueries({ queryKey: storeQueryKeys.order(orderId) });
    },
  });
}

export function useCancelStoreOrderMutation(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => storeApi.cancelOrder(orderId),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: storeQueryKeys.orders });
      void queryClient.invalidateQueries({ queryKey: storeQueryKeys.order(orderId) });
      void queryClient.invalidateQueries({ queryKey: ['store', 'products'] });
    },
  });
}
