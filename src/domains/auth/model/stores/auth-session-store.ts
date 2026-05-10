import { create } from "zustand";
import type { AuthUser } from "@/domains/auth/model/types/auth.types";

// ===================== TYPES =====================
type AuthSessionStatus = "checking" | "authenticated" | "unauthenticated";

type AuthSessionState = {
  status: AuthSessionStatus;
  user: AuthUser | null;
  setAuthenticated(user: AuthUser): void;
  setChecking(): void;
  setUnauthenticated(): void;
};

// ===================== STORE =====================

export const useAuthSessionStore = create<AuthSessionState>((set) => ({
  // ===================== INITIAL STATE =====================

  status: "checking",
  user: null,

  // ===================== ACTIONS =====================

  setAuthenticated(user) {
    set({
      status: "authenticated",
      user,
    });
  },

  setChecking() {
    set({
      status: "checking",
      user: null,
    });
  },

  setUnauthenticated() {
    set({
      status: "unauthenticated",
      user: null,
    });
  },
}));
