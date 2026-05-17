'use client';

import { create } from 'zustand';
import type { AuthUser } from '@/domains/auth/model/types/auth.types';

// ===================== TYPES =====================
type AuthSessionState = {
  accessToken: string | null;
  user: AuthUser | null;
  isInitialized: boolean;
  setSession(session: { accessToken: string; user: AuthUser }): void;
  clearSession(): void;
  setInitialized(value: boolean): void;
};

// ===================== STORE =====================
export const useAuthSessionStore = create<AuthSessionState>()(set => ({
  // ===================== INITIAL STATE =====================

  accessToken: null,
  user: null,
  isInitialized: false,

  // ===================== ACTIONS =====================

  setSession(session) {
    set({
      accessToken: session.accessToken,
      user: session.user,
    });
  },

  clearSession() {
    set({
      accessToken: null,
      user: null,
    });
  },

  setInitialized(value) {
    set({ isInitialized: value });
  },
}));
