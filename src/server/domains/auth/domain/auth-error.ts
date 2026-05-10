import type { BackendMessageKey } from "@/server/shared/i18n/backend-messages";

// ===================== TYPES =====================
export type AuthErrorCode =
  | "EMAIL_ALREADY_EXISTS"
  | "INVALID_CREDENTIALS"
  | "INVALID_INPUT"
  | "SESSION_CONFLICT"
  | "SESSION_NOT_FOUND";

export type AuthError = Error & {
  code: AuthErrorCode;
  messageKey: BackendMessageKey;
  status: number;
};

// ===================== HELPERS =====================
export const authError = {
  create(
    code: AuthErrorCode,
    messageKey: BackendMessageKey,
    status: number,
  ): AuthError {
    return Object.assign(new Error(messageKey), {
      code,
      messageKey,
      name: "AuthError",
      status,
    });
  },

  is(error: unknown): error is AuthError {
    return (
      error instanceof Error &&
      "code" in error &&
      "messageKey" in error &&
      "status" in error
    );
  },
};
