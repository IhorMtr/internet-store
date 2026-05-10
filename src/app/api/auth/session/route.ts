import { NextResponse, type NextRequest } from "next/server";
import { authService } from "@/server/domains/auth/infrastructure/auth-service-factory";
import {
  authRoutePresenter,
  authRouteRequest,
} from "@/app/api/auth/_shared/auth-route-helpers";
import { backendResponse } from "@/server/shared/http/base-response";

// ===================== CONSTANTS =====================
export const runtime = "nodejs";

// ===================== HANDLERS =====================
export async function GET(request: NextRequest) {
  try {
    const currentSession = await authService.getCurrentAccessSession(
      authRouteRequest.getBearerToken(request),
    );

    if (!currentSession) {
      return NextResponse.json(
        backendResponse.success({ authenticated: false }),
        {
          status: 200,
        },
      );
    }

    return NextResponse.json(
      backendResponse.success({
        authenticated: true,
        user: authRoutePresenter.user(currentSession.user),
      }),
      { status: 200 },
    );
  } catch (error) {
    return authRoutePresenter.error(error, request);
  }
}
