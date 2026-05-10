import type { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/server/shared/config/env";

// ===================== CONSTANTS =====================
export const REFRESH_TOKEN_COOKIE_NAME = "internet_store_refresh_token";

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const REFRESH_TOKEN_COOKIE_PATH = "/api/auth";

// ===================== HELPERS =====================
export const refreshTokenCookie = {
  get(request: NextRequest): string | null {
    return request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? null;
  },

  set(response: NextResponse, refreshToken: string): void {
    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE_NAME,
      value: refreshToken,
      httpOnly: true,
      secure: serverEnv.nodeEnv === "production",
      sameSite: "lax",
      path: REFRESH_TOKEN_COOKIE_PATH,
      maxAge: REFRESH_TOKEN_TTL_SECONDS,
    });
  },

  clear(response: NextResponse): void {
    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: serverEnv.nodeEnv === "production",
      sameSite: "lax",
      path: REFRESH_TOKEN_COOKIE_PATH,
      maxAge: 0,
    });
  },
};
