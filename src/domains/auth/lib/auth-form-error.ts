import type { useTranslations } from "next-intl";
import { apiError } from "@/shared/api/errors";

// ===================== TYPES =====================
type AuthErrorTranslator = ReturnType<typeof useTranslations<"auth.errors">>;

// ===================== HELPERS =====================
export function getAuthFormErrorMessage(
  error: unknown,
  t: AuthErrorTranslator,
): string {
  const normalizedError = apiError.normalize(error);

  if (normalizedError.code === "NETWORK_ERROR") {
    return t("network");
  }

  if (normalizedError.code === "UNKNOWN_ERROR") {
    return t("unexpected");
  }

  return normalizedError.message || t("unexpected");
}
