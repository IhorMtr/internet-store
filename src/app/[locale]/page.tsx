"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// ===================== COMPONENT =====================

export default function LocaleEntryPage() {
  // ===================== HOOKS =====================

  const locale = useLocale();
  const router = useRouter();

  // ===================== EFFECTS =====================

  useEffect(() => {
    router.replace(`/${locale}/home`);
  }, [locale, router]);

  // ===================== RENDER =====================

  return null;
}
