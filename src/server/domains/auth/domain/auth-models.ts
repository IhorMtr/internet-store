// ===================== TYPES =====================
export type AuthRole = "admin" | "user";

export type AuthUser = {
  userId: number;
  roleName: AuthRole;
  customerId: number | null;
  email: string;
  fullName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthUserWithPassword = AuthUser & {
  passwordHash: string;
};

export type AuthSession = {
  sessionId: string;
  userId: number;
  refreshTokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  userAgent: string | null;
  ipAddress: string | null;
};

export type CurrentAuthSession = {
  user: AuthUser;
  session: AuthSession;
};

export type AccessTokenPayload = {
  email: string;
  roleName: AuthRole;
  tokenType: "access";
  userId: number;
};

export type RefreshTokenPayload = {
  jti: string;
  roleName: AuthRole;
  tokenType: "refresh";
  userId: number;
};
