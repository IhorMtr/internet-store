import type { NextRequest } from "next/server";

// ===================== TYPES =====================
export type BackendLocale = "en" | "uk";

export type BackendMessageKey =
  | "auth.emailAlreadyExists"
  | "auth.emailInvalid"
  | "auth.emailRequired"
  | "auth.invalidCredentials"
  | "auth.passwordMinLength"
  | "auth.passwordRequired"
  | "auth.requestBodyInvalid"
  | "auth.requestBodyObjectRequired"
  | "auth.sessionConflict"
  | "auth.sessionNotActive"
  | "common.internalServerError";

// ===================== CONSTANTS =====================
const FALLBACK_LOCALE: BackendLocale = "en";

const messages: Record<BackendLocale, Partial<Record<BackendMessageKey, string>>> = {
  en: {
    "auth.emailAlreadyExists": "User with this email already exists",
    "auth.emailInvalid": "Email is invalid",
    "auth.emailRequired": "Email is required",
    "auth.invalidCredentials": "Email or password is incorrect",
    "auth.passwordMinLength": "Password must contain at least 8 characters",
    "auth.passwordRequired": "Password is required",
    "auth.requestBodyInvalid": "Request body must be valid JSON",
    "auth.requestBodyObjectRequired": "Request body must be an object",
    "auth.sessionConflict": "Session could not be created. Please try again",
    "auth.sessionNotActive": "Session is not active",
    "common.internalServerError": "Internal server error",
  },
  uk: {
    "auth.emailAlreadyExists": "Користувач із цією поштою вже існує",
    "auth.emailInvalid": "Некоректна електронна пошта",
    "auth.emailRequired": "Електронна пошта обов'язкова",
    "auth.invalidCredentials": "Електронна пошта або пароль неправильні",
    "auth.passwordMinLength": "Пароль має містити щонайменше 8 символів",
    "auth.passwordRequired": "Пароль обов'язковий",
    "auth.requestBodyInvalid": "Тіло запиту має бути валідним JSON",
    "auth.requestBodyObjectRequired": "Тіло запиту має бути об'єктом",
    "auth.sessionNotActive": "Сесія неактивна",
    "common.internalServerError": "Внутрішня помилка сервера",
  },
};

// ===================== HELPERS =====================
function getLocaleFromAcceptLanguage(header: string): BackendLocale {
  const requestedLocale = header
    .split(",")[0]
    ?.trim()
    .split("-")[0]
    ?.toLowerCase();

  if (requestedLocale === "uk" || requestedLocale === "en") {
    return requestedLocale;
  }

  return FALLBACK_LOCALE;
}

// ===================== EXPORTS =====================
export const backendMessages = {
  getLocale(request: NextRequest): BackendLocale {
    return getLocaleFromAcceptLanguage(
      request.headers.get("accept-language") ?? "",
    );
  },

  translate(key: BackendMessageKey, locale: BackendLocale): string {
    return (
      messages[locale][key] ??
      messages[FALLBACK_LOCALE][key] ??
      messages[FALLBACK_LOCALE]["common.internalServerError"] ??
      "Internal server error"
    );
  },
};
