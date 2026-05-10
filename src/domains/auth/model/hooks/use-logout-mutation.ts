"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/domains/auth/api/auth.api";

// ===================== HOOK =====================

export function useLogoutMutation() {
  // ===================== MUTATIONS =====================

  return useMutation({
    mutationFn: authApi.logout,
  });
}
