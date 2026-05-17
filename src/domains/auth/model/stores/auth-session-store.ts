'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthUser } from '@/domains/auth/model/types/auth.types';

// ===================== TYPES =====================
type AuthSessionStatus = 'checking' | 'authenticated' | 'unauthenticated';

type AuthSessionState = {
  status: AuthSessionStatus;
  user: AuthUser | null;
  accessToken: string | null;
  setAuthenticated(user: AuthUser, accessToken?: string | null): void;
  setSession(user: AuthUser, accessToken: string): void;
  setAccessToken(accessToken: string | null): void;
  clearSession(): void;
  setChecking(): void;
  setUnauthenticated(): void;
};

const AUTH_SESSION_STORAGE_KEY = 'shopcore-auth-session';

// ===================== STORE =====================

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set, get) => ({
      // ===================== INITIAL STATE =====================

      status: 'checking',
      user: null,
      accessToken: null,

      // ===================== ACTIONS =====================

      setAuthenticated(user, accessToken) {
        set(state => ({
          status: 'authenticated',
          user,
          accessToken: accessToken ?? state.accessToken,
        }));
      },

      setSession(user, accessToken) {
        set({
          status: 'authenticated',
          user,
          accessToken,
        });
      },

      setAccessToken(accessToken) {
        set({ accessToken });
      },

      clearSession() {
        set({
          status: 'unauthenticated',
          user: null,
          accessToken: null,
        });
      },

      setChecking() {
        set({
          status: 'checking',
          user: null,
        });
      },

      setUnauthenticated() {
        get().clearSession();
      },
    }),
    {
      name: AUTH_SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
