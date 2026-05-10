import { isIP } from "net";
import { NextResponse, type NextRequest } from "next/server";
import { authError } from "@/server/domains/auth/domain/auth-error";
import type {
  AuthSession,
  AuthUser,
} from "@/server/domains/auth/domain/auth-models";
import { backendResponse } from "@/server/shared/http/base-response";
import { backendMessages } from "@/server/shared/i18n/backend-messages";

// ===================== TYPES =====================
type AuthRequestContext = {
  userAgent: string | null;
  ipAddress: string | null;
};

export type PublicAuthUser = {
  userId: number;
  roleName: AuthUser["roleName"];
  customerId: number | null;
  email: string;
  fullName: string | null;
};

export type PublicAuthSession = {
  sessionId: string;
  expiresAt: string;
};

// ===================== HELPERS =====================
function getRequestIpAddress(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const candidate = forwardedFor?.split(",")[0]?.trim() ?? realIp?.trim();

  if (!candidate || isIP(candidate) === 0) {
    return null;
  }

  return candidate;
}

// ===================== EXPORTS =====================
export const authRouteRequest = {
  async readJsonBody(request: NextRequest): Promise<Record<string, unknown>> {
    try {
      const body = await request.json();

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw authError.create(
          "INVALID_INPUT",
          "auth.requestBodyObjectRequired",
          400,
        );
      }

      return body as Record<string, unknown>;
    } catch (error) {
      if (authError.is(error)) {
        throw error;
      }

      throw authError.create("INVALID_INPUT", "auth.requestBodyInvalid", 400);
    }
  },

  getContext(request: NextRequest): AuthRequestContext {
    return {
      userAgent: request.headers.get("user-agent"),
      ipAddress: getRequestIpAddress(request),
    };
  },

  getBearerToken(request: NextRequest): string | null {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return null;
    }

    const token = authorization.slice("Bearer ".length).trim();

    return token.length > 0 ? token : null;
  },
};

export const authRoutePresenter = {
  user(user: AuthUser): PublicAuthUser {
    return {
      userId: user.userId,
      roleName: user.roleName,
      customerId: user.customerId,
      email: user.email,
      fullName: user.fullName,
    };
  },

  session(session: AuthSession): PublicAuthSession {
    return {
      sessionId: session.sessionId,
      expiresAt: session.expiresAt.toISOString(),
    };
  },

  error(error: unknown, request: NextRequest): NextResponse {
    const locale = backendMessages.getLocale(request);

    if (authError.is(error)) {
      return NextResponse.json(
        backendResponse.error(
          backendMessages.translate(error.messageKey, locale),
        ),
        { status: error.status },
      );
    }

    console.error("[api][auth] unexpected error", error);

    return NextResponse.json(
      backendResponse.error(
        backendMessages.translate("common.internalServerError", locale),
      ),
      { status: 500 },
    );
  },
};
