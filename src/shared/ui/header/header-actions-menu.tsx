'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { AuthUser } from '@/domains/auth/model/types/auth.types';
import { Button } from '@/shared/ui/button';
import { LanguageSwitcher } from '@/shared/ui/i18n/language-switcher';
import { Popover } from '@/shared/ui/popover';
import { ThemeToggle } from '@/shared/ui/theme/theme-toggle';

// ========== Types ==========

type HeaderActionsMenuProps = {
  roleName?: AuthUser['roleName'];
  cartItemsCount?: number;
  isSigningOut?: boolean;
  onSignOut?: () => void;
};

// ========== Component ==========

export function HeaderActionsMenu({
  roleName,
  cartItemsCount = 0,
  isSigningOut = false,
  onSignOut,
}: HeaderActionsMenuProps) {
  // ========== Hooks ==========

  const t = useTranslations('header');
  const canAccessStore = roleName === 'user';
  const canAccessAdminPanel = roleName === 'admin';

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

          {canAccessStore ? (
            <div className="grid gap-2">
              <p className="text-caption font-semibold uppercase text-muted">{t('store')}</p>
              <Link
                href="/catalog"
                className="ds-transition inline-flex items-center justify-center rounded-md border bg-surface px-4 py-2 text-body font-medium text-primary shadow-soft outline-none hover:bg-surface-raised focus-visible:shadow-focus"
              >
                {t('catalog')}
              </Link>
              <Link
                href="/cart"
                className="ds-transition inline-flex items-center justify-center rounded-md border bg-surface px-4 py-2 text-body font-medium text-primary shadow-soft outline-none hover:bg-surface-raised focus-visible:shadow-focus"
              >
                {t('cart', { count: cartItemsCount })}
              </Link>
              <Link
                href="/orders"
                className="ds-transition inline-flex items-center justify-center rounded-md border bg-surface px-4 py-2 text-body font-medium text-primary shadow-soft outline-none hover:bg-surface-raised focus-visible:shadow-focus"
              >
                {t('orders')}
              </Link>
            </div>
          ) : null}

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
