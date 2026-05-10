import { createHash, randomUUID } from "crypto";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { authError } from "@/server/domains/auth/domain/auth-error";
import type {
  AccessTokenPayload,
  AuthUser,
  RefreshTokenPayload,
} from "@/server/domains/auth/domain/auth-models";
import type { TokenService } from "@/server/domains/auth/application/auth-ports";
import { serverEnv } from "@/server/shared/config/env";

// ===================== CONSTANTS =====================
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(serverEnv.accessTokenSecret);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  serverEnv.refreshTokenSecret,
);

// ===================== HELPERS =====================
function getRefreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
}

function isAccessTokenPayload(
  payload: JWTPayload,
): payload is JWTPayload & AccessTokenPayload {
  return (
    payload.tokenType === "access" &&
    typeof payload.sub === "string" &&
    typeof payload.userId === "number" &&
    typeof payload.email === "string" &&
    (payload.roleName === "admin" || payload.roleName === "user")
  );
}

function isRefreshTokenPayload(
  payload: JWTPayload,
): payload is JWTPayload & RefreshTokenPayload {
  return (
    payload.tokenType === "refresh" &&
    typeof payload.jti === "string" &&
    typeof payload.sub === "string" &&
    typeof payload.userId === "number" &&
    (payload.roleName === "admin" || payload.roleName === "user")
  );
}

// ===================== SERVICES =====================
export const joseTokenService: TokenService = {
  async createAccessToken(user: AuthUser): Promise<string> {
    return new SignJWT({
      email: user.email,
      roleName: user.roleName,
      tokenType: "access",
      userId: user.userId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(user.userId))
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
      .sign(ACCESS_TOKEN_SECRET);
  },

  async createRefreshToken(user: AuthUser): Promise<{
    expiresAt: Date;
    token: string;
  }> {
    const expiresAt = getRefreshTokenExpiresAt();
    const token = await new SignJWT({
      roleName: user.roleName,
      tokenType: "refresh",
      userId: user.userId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(user.userId))
      .setJti(randomUUID())
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(REFRESH_TOKEN_SECRET);

    return {
      expiresAt,
      token,
    };
  },

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET);

      if (!isAccessTokenPayload(payload)) {
        throw authError.create("SESSION_NOT_FOUND", "auth.sessionNotActive", 401);
      }

      return {
        email: payload.email,
        roleName: payload.roleName,
        tokenType: "access",
        userId: payload.userId,
      };
    } catch (error) {
      if (authError.is(error)) {
        throw error;
      }

      throw authError.create("SESSION_NOT_FOUND", "auth.sessionNotActive", 401);
    }
  },

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, REFRESH_TOKEN_SECRET);

      if (!isRefreshTokenPayload(payload)) {
        throw authError.create("SESSION_NOT_FOUND", "auth.sessionNotActive", 401);
      }

      return {
        jti: payload.jti,
        roleName: payload.roleName,
        tokenType: "refresh",
        userId: payload.userId,
      };
    } catch (error) {
      if (authError.is(error)) {
        throw error;
      }

      throw authError.create("SESSION_NOT_FOUND", "auth.sessionNotActive", 401);
    }
  },

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  },
};
