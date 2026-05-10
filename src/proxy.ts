import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// ===================== MIDDLEWARE =====================

export default createMiddleware(routing);

// ===================== CONFIG =====================

export const config = {
  matcher: ["/", "/(uk|en)/:path*", "/((?!api|_next|.*\\..*).*)"],
};
