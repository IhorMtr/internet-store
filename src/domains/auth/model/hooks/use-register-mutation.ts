"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/domains/auth/api/auth.api";
import { useAuthSessionStore } from "@/domains/auth/model/stores/auth-session-store";

// ===================== HOOK =====================

export function useRegisterMutation() {
  // ===================== STORE =====================

  const setAuthenticated = useAuthSessionStore(
    (state) => state.setAuthenticated,
  );

  // ===================== MUTATIONS =====================

  return useMutation({
    mutationFn: authApi.register,
    onSuccess(response) {
      setAuthenticated(response.data.user);
    },
  });
}
