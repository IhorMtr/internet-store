'use client';

import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/domains/auth/api/auth.api';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';

// ========== Hook ==========

export function useRegisterMutation() {
  // ========== Store ==========

  const setSession = useAuthSessionStore(state => state.setSession);
  const setInitialized = useAuthSessionStore(state => state.setInitialized);

  // ========== Mutations ==========

  return useMutation({
    mutationFn: authApi.register,
    onSuccess(response) {
      setSession({
        accessToken: response.data.accessToken,
        user: response.data.user,
      });
      setInitialized(true);
    },
  });
}
