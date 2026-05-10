import { NextResponse, type NextRequest } from "next/server";
import { authService } from "@/server/domains/auth/infrastructure/auth-service-factory";
import { authRoutePresenter } from "@/app/api/auth/_shared/auth-route-helpers";
import { backendResponse } from "@/server/shared/http/base-response";
import { refreshTokenCookie } from "@/server/shared/http/session-cookie";

// ===================== CONSTANTS =====================
export const runtime = "nodejs";

// ===================== HANDLERS =====================
export async function POST(request: NextRequest) {
  try {
    await authService.logout(refreshTokenCookie.get(request));

    const response = NextResponse.json(
      backendResponse.success({ loggedOut: true }),
      { status: 200 },
    );

    refreshTokenCookie.clear(response);

    return response;
  } catch (error) {
    return authRoutePresenter.error(error, request);
  }
}
