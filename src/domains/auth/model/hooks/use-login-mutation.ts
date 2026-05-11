"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/domains/auth/api/auth.api";
import { useAuthSessionStore } from "@/domains/auth/model/stores/auth-session-store";

// ========== Hook ==========

export function useLoginMutation() {
  // ========== Store ==========

  const setAuthenticated = useAuthSessionStore(
    (state) => state.setAuthenticated,
  );

  // ========== Mutations ==========

  return useMutation({
    mutationFn: authApi.login,
    onSuccess(response) {
      setAuthenticated(response.data.user);
    },
  });
}
