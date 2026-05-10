import { authError, type AuthError } from '@/server/domains/auth/domain/auth-error';
import type { AuthSession, AuthUser, CurrentAuthSession } from '@/server/domains/auth/domain/auth-models';
import type { AuthRepository, PasswordService, TokenService } from '@/server/domains/auth/application/auth-ports';

// ===================== TYPES =====================
type AuthRequestContext = {
  userAgent: string | null;
  ipAddress: string | null;
};

type AuthInput = Record<string, unknown>;

type AuthServiceDependencies = {
  repository: AuthRepository;
  passwordService: PasswordService;
  tokenService: TokenService;
};

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  session: AuthSession;
};

export type CurrentAccessSession = {
  user: AuthUser;
};

// ===================== CONSTANTS =====================
const MIN_PASSWORD_LENGTH = 8;

// ===================== HELPERS =====================
function normalizeEmail(email: unknown): string {
  if (typeof email !== 'string') {
    throw authError.create('INVALID_INPUT', 'auth.emailRequired', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw authError.create('INVALID_INPUT', 'auth.emailInvalid', 400);
  }

  return normalizedEmail;
}

function readPassword(password: unknown): string {
  if (typeof password !== 'string') {
    throw authError.create('INVALID_INPUT', 'auth.passwordRequired', 400);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw authError.create('INVALID_INPUT', 'auth.passwordMinLength', 400);
  }

  return password;
}

function normalizeFullName(fullName: unknown): string | null {
  if (fullName === undefined || fullName === null) {
    return null;
  }

  if (typeof fullName !== 'string') {
    throw authError.create('INVALID_INPUT', 'auth.requestBodyInvalid', 400);
  }

  const normalizedFullName = fullName.trim();

  return normalizedFullName.length > 0 ? normalizedFullName : null;
}

function toSafeUser(user: AuthUser): AuthUser {
  return {
    userId: user.userId,
    roleName: user.roleName,
    customerId: user.customerId,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ===================== SERVICES =====================
export function createAuthService({ repository, passwordService, tokenService }: AuthServiceDependencies) {
  async function createTokenPairForUser(user: AuthUser, context: AuthRequestContext): Promise<AuthResult> {
    const accessToken = await tokenService.createAccessToken(user);
    const refreshToken = await tokenService.createRefreshToken(user);
    const session = await repository.createSession({
      userId: user.userId,
      refreshTokenHash: tokenService.hashToken(refreshToken.token),
      expiresAt: refreshToken.expiresAt,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    });

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user,
      session,
    };
  }

  async function register(input: AuthInput, context: AuthRequestContext): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    const password = readPassword(input.password);
    const fullName = normalizeFullName(input.fullName);
    const existingUser = await repository.findUserByEmail(email);

    if (existingUser) {
      throw authError.create('EMAIL_ALREADY_EXISTS', 'auth.emailAlreadyExists', 409);
    }

    const passwordHash = await passwordService.hash(password);
    const user = await repository.createUser({
      email,
      passwordHash,
      fullName,
      roleName: 'user',
    });

    return createTokenPairForUser(user, context);
  }

  async function login(input: AuthInput, context: AuthRequestContext): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    const password = readPassword(input.password);
    const user = await repository.findUserByEmail(email);

    if (!user || !user.isActive) {
      throw authError.create('INVALID_CREDENTIALS', 'auth.invalidCredentials', 401);
    }

    const passwordMatches = await passwordService.verify(password, user.passwordHash);

    if (!passwordMatches) {
      throw authError.create('INVALID_CREDENTIALS', 'auth.invalidCredentials', 401);
    }

    return createTokenPairForUser(toSafeUser(user), context);
  }

  async function getCurrentAccessSession(accessToken: string | null): Promise<CurrentAccessSession | null> {
    if (!accessToken) {
      return null;
    }

    const payload = await tokenService.verifyAccessToken(accessToken);
    const user = await repository.findActiveUserById(payload.userId);

    return user ? { user } : null;
  }

  async function getCurrentRefreshSession(refreshToken: string | null): Promise<CurrentAuthSession | null> {
    if (!refreshToken) {
      return null;
    }

    await tokenService.verifyRefreshToken(refreshToken);

    const currentSession = await repository.findCurrentSession(tokenService.hashToken(refreshToken));

    if (!currentSession) {
      return null;
    }

    await repository.updateSessionLastUsed(currentSession.session.sessionId);

    return currentSession;
  }

  async function getOrCreateCustomerForUser(user: AuthUser): Promise<number | null> {
    if (user.customerId) {
      return user.customerId;
    }

    if (user.roleName !== 'user') {
      return null;
    }

    return repository.getOrCreateCustomerForUser(user.userId);
  }

  async function logout(refreshToken: string | null): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const currentSession = await getCurrentRefreshSession(refreshToken);

      if (currentSession) {
        await repository.revokeAllUserSessions(currentSession.user.userId);
        return;
      }
    } catch {
      // Logout should be idempotent even when the cookie is already stale.
    }

    await repository.revokeSession(tokenService.hashToken(refreshToken));
  }

  async function refresh(refreshToken: string | null, context: AuthRequestContext): Promise<AuthResult> {
    const currentSession = await getCurrentRefreshSession(refreshToken);

    if (!currentSession) {
      throw authError.create('SESSION_NOT_FOUND', 'auth.sessionNotActive', 401);
    }

    return createTokenPairForUser(currentSession.user, context);
  }

  return {
    getCurrentAccessSession,
    getCurrentRefreshSession,
    getOrCreateCustomerForUser,
    login,
    logout,
    refresh,
    register,
  };
}

// ===================== EXPORTS =====================
export type AuthService = ReturnType<typeof createAuthService>;
export type { AuthError };
