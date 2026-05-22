'use client';

import { create } from 'zustand';
import type { AuthUser } from '@/domains/auth/model/types/auth.types';

// ===================== TYPES =====================
type AuthSessionState = {
  accessToken: string | null;
  user: AuthUser | null;
  isInitialized: boolean;
  sessionVersion: number;
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
  sessionVersion: 0,

  // ===================== ACTIONS =====================

  setSession(session) {
    set({
      accessToken: session.accessToken,
      user: session.user,
    });
  },

  clearSession() {
    set(state => ({
      accessToken: null,
      user: null,
      sessionVersion: state.sessionVersion + 1,
    }));
  },

  setInitialized(value) {
    set({ isInitialized: value });
  },
}));
