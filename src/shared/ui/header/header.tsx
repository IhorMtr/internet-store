'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLogoutMutation } from '@/domains/auth/model/hooks/use-logout-mutation';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';
import { HeaderActionsMenu } from '@/shared/ui/header/header-actions-menu';

// ========== Component ==========

export function Header() {
  // ========== Hooks ==========

  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('header');
  const logoutMutation = useLogoutMutation();
  const userRoleName = useAuthSessionStore(state => state.user?.roleName);
  const setUnauthenticated = useAuthSessionStore(state => state.setUnauthenticated);

  // ========== HANDLERS ==========

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSettled() {
        setUnauthenticated();
        router.replace(`/${locale}/auth/login`);
      },
    });
  }

  // ========== Render ==========

  return (
    <header className="border-b bg-surface/90 backdrop-blur">
      <div className="ds-container flex items-center justify-between gap-3 py-3">
        <p className="text-title font-semibold">{t('brand')}</p>

        <HeaderActionsMenu
          canAccessAdminPanel={userRoleName === 'admin'}
          onSignOut={handleLogout}
          isSigningOut={logoutMutation.isPending}
        />
      </div>
    </header>
  );
}
