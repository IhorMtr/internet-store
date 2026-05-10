import { defineRouting } from "next-intl/routing";

// ===================== ROUTING =====================

export const routing = defineRouting({
  locales: ["uk", "en"],
  defaultLocale: "uk",
  localePrefix: "always",
});

// ===================== TYPES =====================

export type Locale = (typeof routing.locales)[number];
