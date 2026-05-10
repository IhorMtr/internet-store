import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

// ===================== HELPERS =====================

function isLocale(value: string | undefined): value is Locale {
  return routing.locales.includes(value as Locale);
}

// ===================== REQUEST CONFIG =====================

export default getRequestConfig(async ({ requestLocale }) => {
  // ===================== DERIVED VALUES =====================

  const requestedLocale = await requestLocale;
  const locale = isLocale(requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const messages = (await import(`../shared/messages/${locale}.json`)).default;

  // ===================== RETURN =====================

  return {
    locale,
    messages,
  };
});
