import type {
  AuthRole,
  AuthSession,
  AuthUser,
  AuthUserWithPassword,
  AccessTokenPayload,
  CurrentAuthSession,
  RefreshTokenPayload,
} from "@/server/domains/auth/domain/auth-models";

// ===================== TYPES =====================
export type CreateAuthUserInput = {
  email: string;
  passwordHash: string;
  fullName: string | null;
  roleName: AuthRole;
};

export type CreateAuthSessionInput = {
  userId: number;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
};

export interface AuthRepository {
  createUser(input: CreateAuthUserInput): Promise<AuthUser>;
  findUserByEmail(email: string): Promise<AuthUserWithPassword | null>;
  findActiveUserById(userId: number): Promise<AuthUser | null>;
  createSession(input: CreateAuthSessionInput): Promise<AuthSession>;
  findCurrentSession(
    refreshTokenHash: string,
  ): Promise<CurrentAuthSession | null>;
  updateSessionLastUsed(sessionId: string): Promise<void>;
  revokeAllUserSessions(userId: number): Promise<void>;
  revokeSession(refreshTokenHash: string): Promise<void>;
}

export interface PasswordService {
  hash(password: string): Promise<string>;
  verify(password: string, passwordHash: string): Promise<boolean>;
}

export interface TokenService {
  createAccessToken(user: AuthUser): Promise<string>;
  createRefreshToken(user: AuthUser): Promise<{
    expiresAt: Date;
    token: string;
  }>;
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;
  verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;
  hashToken(token: string): string;
}
