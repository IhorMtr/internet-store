"use client";

import { useMutation } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { authApi } from "@/domains/auth/api/auth.api";
import { useAuthSessionStore } from "@/domains/auth/model/stores/auth-session-store";
import { apiAuthHeader } from "@/shared/api/auth-header";
import { apiClient } from "@/shared/api/client";

// ===================== TYPES =====================
type AuthProviderProps = {
  children: ReactNode;
};

// ===================== CONSTANTS =====================
const ACCESS_TOKEN_REFRESH_INTERVAL_MS = 1000 * 60 * 14;

// ===================== HELPERS =====================
function getLoginPath(locale: string): string {
  return `/${locale}/auth/login`;
}

// ===================== COMPONENT =====================

export function AuthProvider({ children }: AuthProviderProps) {
  // ===================== HOOKS =====================

  const locale = useLocale();
  const router = useRouter();

  // ===================== STORE =====================

  const status = useAuthSessionStore((state) => state.status);
  const setAuthenticated = useAuthSessionStore(
    (state) => state.setAuthenticated,
  );
  const setChecking = useAuthSessionStore((state) => state.setChecking);
  const setUnauthenticated = useAuthSessionStore(
    (state) => state.setUnauthenticated,
  );

  // ===================== STATE =====================

  const didInitialRefresh = useRef(false);

  // ===================== MUTATIONS =====================

  const { mutate: refresh } = useMutation({
    mutationFn: authApi.refresh,
    retry: false,
    meta: {
      suppressToast: true,
    },
    onSuccess(response) {
      setAuthenticated(response.data.user);
    },
    onError() {
      apiAuthHeader.clear(apiClient);
      setUnauthenticated();
      router.replace(getLoginPath(locale));
    },
  });

  // ===================== EFFECTS =====================

  useEffect(() => {
    if (status !== "checking") {
      return;
    }

    if (didInitialRefresh.current) {
      return;
    }

    didInitialRefresh.current = true;
    setChecking();
    refresh();
  }, [refresh, setChecking, status]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const intervalId = window.setInterval(() => {
      refresh();
    }, ACCESS_TOKEN_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [refresh, status]);

  // ===================== RENDER =====================

  if (status === "checking") {
    return (
      <div className="flex min-h-full items-center justify-center bg-canvas px-4 text-primary">
        <div className="rounded-md border bg-surface px-4 py-3 text-body text-muted shadow-soft">
          Checking session...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return children;
}
