"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/domains/auth/api/auth.api";

// ========== Hook ==========

export function useLogoutMutation() {
  // ========== Mutations ==========

  return useMutation({
    mutationFn: authApi.logout,
  });
}
