'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';

// ========== Types ==========

type AdminNavigationItem = {
  key: string;
  href: string;
};

// ========== Constants ==========

const navigationItems: AdminNavigationItem[] = [
  { key: 'dashboard', href: '/admin' },
  { key: 'categories', href: '/admin/categories' },
  { key: 'products', href: '/admin/products' },
  { key: 'suppliers', href: '/admin/suppliers' },
  { key: 'deliveries', href: '/admin/deliveries' },
  { key: 'orders', href: '/admin/orders' },
  { key: 'reports', href: '/admin/reports' },
];

// ========== Hook ==========

export function useAdminLayout() {
  // ========== Translations ==========

  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Admin');

  // ========== State ==========

  const isInitialized = useAuthSessionStore(state => state.isInitialized);
  const userRoleName = useAuthSessionStore(state => state.user?.roleName);

  // ========== Derived Data ==========

  const isLoading = !isInitialized;
  const isAllowed = isInitialized && userRoleName === 'admin';
  const isForbidden = isInitialized && userRoleName === 'user';

  // ========== Handlers ==========

  useEffect(() => {
    if (!isForbidden) {
      return;
    }

    router.replace('/home');
  }, [isForbidden, router]);

  // ========== Return ==========

  return {
    t,
    pathname,
    navigationItems,
    isAllowed,
    isForbidden,
    isLoading,
  };
}
