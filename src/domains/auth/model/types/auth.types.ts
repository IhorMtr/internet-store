import type { BaseResponse } from "@/shared/api/types";

// ===================== TYPES =====================
export type AuthUser = {
  userId: number;
  roleName: "admin" | "user";
  customerId: number | null;
  email: string;
  fullName: string | null;
};

export type AuthSession = {
  sessionId: string;
  expiresAt: string;
};

export type AuthTokens = {
  accessToken: string;
};

export type AuthData = AuthTokens & {
  user: AuthUser;
  session: AuthSession;
};

export type LogoutData = {
  loggedOut: boolean;
};

export type RegisterResponse = BaseResponse<AuthData>;
export type LoginResponse = BaseResponse<AuthData>;
export type RefreshResponse = BaseResponse<AuthData>;
export type LogoutResponse = BaseResponse<LogoutData>;
