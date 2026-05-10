"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { LanguageSwitcher } from "@/shared/ui/i18n/language-switcher";
import { Popover } from "@/shared/ui/popover";
import { ThemeToggle } from "@/shared/ui/theme/theme-toggle";

// ===================== TYPES =====================

type HeaderActionsMenuProps = {
  isSigningOut?: boolean;
  onSignOut?: () => void;
};

// ===================== COMPONENT =====================

export function HeaderActionsMenu({
  isSigningOut = false,
  onSignOut,
}: HeaderActionsMenuProps) {
  // ===================== HOOKS =====================

  const t = useTranslations("header");

  // ===================== RENDER =====================

  return (
    <Popover
      align="end"
      className="grid w-max min-w-64 gap-4"
      trigger={
        <Button aria-label={t("openMenu")} variant="secondary" size="sm">
          {t("menu")}
        </Button>
      }
      content={
        <>
          <div className="grid gap-2">
            <p className="text-caption font-semibold uppercase text-muted">
              {t("language")}
            </p>
            <LanguageSwitcher />
          </div>

          <div className="grid gap-2">
            <p className="text-caption font-semibold uppercase text-muted">
              {t("theme")}
            </p>
            <ThemeToggle />
          </div>

          {onSignOut ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? t("signingOut") : t("signOut")}
            </Button>
          ) : null}
        </>
      }
    />
  );
}
