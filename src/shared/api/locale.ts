import { routing, type Locale } from "@/i18n/routing";

// ========== Constants ==========
const FALLBACK_LOCALE: Locale = routing.defaultLocale;

// ========== Helpers ==========
function isLocale(value: string | undefined): value is Locale {
  return routing.locales.includes(value as Locale);
}

// ========== Exports ==========
export const apiLocale = {
  getCurrent(): Locale {
    if (typeof window === "undefined") {
      return FALLBACK_LOCALE;
    }

    const [, locale] = window.location.pathname.split("/");

    return isLocale(locale) ? locale : FALLBACK_LOCALE;
  },
};
