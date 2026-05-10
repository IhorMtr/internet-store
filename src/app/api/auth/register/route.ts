import { NextResponse, type NextRequest } from "next/server";
import { authService } from "@/server/domains/auth/infrastructure/auth-service-factory";
import {
  authRoutePresenter,
  authRouteRequest,
} from "@/app/api/auth/_shared/auth-route-helpers";
import { backendResponse } from "@/server/shared/http/base-response";
import { refreshTokenCookie } from "@/server/shared/http/session-cookie";

// ===================== CONSTANTS =====================
export const runtime = "nodejs";

// ===================== HANDLERS =====================
export async function POST(request: NextRequest) {
  try {
    const body = await authRouteRequest.readJsonBody(request);
    const result = await authService.register(
      body,
      authRouteRequest.getContext(request),
    );
    const response = NextResponse.json(
      backendResponse.success({
        accessToken: result.accessToken,
        user: authRoutePresenter.user(result.user),
        session: authRoutePresenter.session(result.session),
      }),
      { status: 201 },
    );

    refreshTokenCookie.set(response, result.refreshToken);

    return response;
  } catch (error) {
    return authRoutePresenter.error(error, request);
  }
}
