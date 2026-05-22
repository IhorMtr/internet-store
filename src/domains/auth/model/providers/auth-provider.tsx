'use client';

import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, type ReactNode } from 'react';
import { authApi } from '@/domains/auth/api/auth.api';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';
import { useRouter } from '@/i18n/navigation';

// ===================== TYPES =====================
type AuthProviderProps = {
  children: ReactNode;
};

// ===================== CONSTANTS =====================
const ACCESS_TOKEN_REFRESH_INTERVAL_MS = 1000 * 60 * 14;

// ===================== COMPONENT =====================

export function AuthProvider({ children }: AuthProviderProps) {
  // ===================== HOOKS =====================

  const t = useTranslations('StorefrontAccess');
  const router = useRouter();

  // ===================== STORE =====================

  const user = useAuthSessionStore(state => state.user);
  const isInitialized = useAuthSessionStore(state => state.isInitialized);
  const setSession = useAuthSessionStore(state => state.setSession);
  const clearSession = useAuthSessionStore(state => state.clearSession);
  const setInitialized = useAuthSessionStore(state => state.setInitialized);

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
      setSession({
        accessToken: response.data.accessToken,
        user: response.data.user,
      });
      setInitialized(true);
    },
    onError() {
      clearSession();
      setInitialized(true);
      router.replace('/auth/login');
    },
  });

  // ===================== EFFECTS =====================

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    if (didInitialRefresh.current) {
      return;
    }

    didInitialRefresh.current = true;
    refresh();
  }, [isInitialized, refresh]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const intervalId = window.setInterval(() => {
      refresh();
    }, ACCESS_TOKEN_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [refresh, user]);

  useEffect(() => {
    if (!isInitialized || user) {
      return;
    }

    router.replace('/auth/login');
  }, [isInitialized, router, user]);

  // ===================== RENDER =====================

  if (!isInitialized) {
    return (
      <div className="flex min-h-full items-center justify-center bg-canvas px-4 text-primary">
        <div className="rounded-md border bg-surface px-4 py-3 text-body text-muted shadow-soft">{t('loading')}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
