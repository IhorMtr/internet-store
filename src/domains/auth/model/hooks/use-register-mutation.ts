"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/domains/auth/api/auth.api";
import { useAuthSessionStore } from "@/domains/auth/model/stores/auth-session-store";

// ========== Hook ==========

export function useRegisterMutation() {
  // ========== Store ==========

  const setAuthenticated = useAuthSessionStore(
    (state) => state.setAuthenticated,
  );

  // ========== Mutations ==========

  return useMutation({
    mutationFn: authApi.register,
    onSuccess(response) {
      setAuthenticated(response.data.user);
    },
  });
}
