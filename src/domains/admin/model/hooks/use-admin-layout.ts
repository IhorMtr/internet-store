'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { usePathname } from '@/i18n/navigation';
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

  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Admin');

  // ========== State ==========

  const status = useAuthSessionStore(state => state.status);
  const userRoleName = useAuthSessionStore(state => state.user?.roleName);

  // ========== Derived Data ==========

  const isLoading = status === 'checking';
  const isAllowed = status === 'authenticated' && userRoleName === 'admin';
  const isForbidden = status === 'authenticated' && userRoleName !== 'admin';

  // ========== Handlers ==========

  useEffect(() => {
    if (!isForbidden) {
      return;
    }

    router.replace(`/${locale}/home`);
  }, [isForbidden, locale, router]);

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
