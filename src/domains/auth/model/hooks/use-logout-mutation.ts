"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/domains/auth/api/auth.api';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';
import { useCartStore } from '@/domains/store/model/stores/cart-store';
import { useRouter } from '@/i18n/navigation';

// ========== Hook ==========

export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthSessionStore(state => state.clearSession);
  const setInitialized = useAuthSessionStore(state => state.setInitialized);
  const clearCart = useCartStore(state => state.clearCart);

  // ========== Mutations ==========

  return useMutation({
    mutationFn: authApi.logout,
    meta: {
      suppressToast: true,
    },
    onSettled() {
      clearSession();
      setInitialized(true);
      clearCart();

      queryClient.removeQueries({
        predicate(query) {
          const scope = query.queryKey[0];
          return scope === 'store' || scope === 'admin';
        },
      });

      router.replace('/auth/login');
    },
  });
}
