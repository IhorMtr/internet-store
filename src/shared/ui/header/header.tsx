'use client';

import { useTranslations } from 'next-intl';
import { useLogoutMutation } from '@/domains/auth/model/hooks/use-logout-mutation';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';
import { cartSelectors, useCartStore } from '@/domains/store/model/stores/cart-store';
import { HeaderActionsMenu } from '@/shared/ui/header/header-actions-menu';

// ========== Component ==========

export function Header() {
  // ========== Hooks ==========

  const t = useTranslations('header');
  const logoutMutation = useLogoutMutation();
  const userRoleName = useAuthSessionStore(state => state.user?.roleName);
  const cartItemsCount = useCartStore(cartSelectors.itemsCount);

  // ========== HANDLERS ==========

  function handleLogout() {
    logoutMutation.mutate();
  }

  // ========== Render ==========

  return (
    <header className="border-b bg-surface/90 backdrop-blur">
      <div className="ds-container flex items-center justify-between gap-3 py-3">
        <p className="text-title font-semibold">{t('brand')}</p>

        <HeaderActionsMenu
          roleName={userRoleName}
          cartItemsCount={cartItemsCount}
          onSignOut={handleLogout}
          isSigningOut={logoutMutation.isPending}
        />
      </div>
    </header>
  );
}
