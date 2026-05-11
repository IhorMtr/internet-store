'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { LanguageSwitcher } from '@/shared/ui/i18n/language-switcher';
import { Popover } from '@/shared/ui/popover';
import { ThemeToggle } from '@/shared/ui/theme/theme-toggle';

// ========== Types ==========

type HeaderActionsMenuProps = {
  canAccessAdminPanel?: boolean;
  isSigningOut?: boolean;
  onSignOut?: () => void;
};

// ========== Component ==========

export function HeaderActionsMenu({
  canAccessAdminPanel = false,
  isSigningOut = false,
  onSignOut,
}: HeaderActionsMenuProps) {
  // ========== Hooks ==========

  const t = useTranslations('header');

  // ========== Render ==========

  return (
    <Popover
      align="end"
      className="grid w-max min-w-64 gap-4"
      trigger={
        <Button aria-label={t('openMenu')} variant="secondary" size="sm">
          {t('menu')}
        </Button>
      }
      content={
        <>
          <div className="grid gap-2">
            <p className="text-caption font-semibold uppercase text-muted">{t('language')}</p>
            <LanguageSwitcher />
          </div>

          <div className="grid gap-2">
            <p className="text-caption font-semibold uppercase text-muted">{t('theme')}</p>
            <ThemeToggle />
          </div>

          {canAccessAdminPanel ? (
            <Link
              href="/admin"
              className="ds-transition inline-flex items-center justify-center rounded-md border bg-surface px-4 py-2 text-body font-medium text-primary shadow-soft outline-none hover:bg-surface-raised focus-visible:shadow-focus"
            >
              {t('adminPanel')}
            </Link>
          ) : null}

          {onSignOut ? (
            <Button type="button" variant="secondary" onClick={onSignOut} disabled={isSigningOut}>
              {isSigningOut ? t('signingOut') : t('signOut')}
            </Button>
          ) : null}
        </>
      }
    />
  );
}
