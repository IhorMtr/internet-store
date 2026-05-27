'use client';

import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tags,
  Truck,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AuthUser } from '@/domains/auth/model/types/auth.types';
import { useAuthSessionStore } from '@/domains/auth/model/stores/auth-session-store';

// ========== Types ==========

type HomeActionKey =
  | 'catalog'
  | 'cart'
  | 'orders'
  | 'adminDashboard'
  | 'products'
  | 'adminOrders'
  | 'reports'
  | 'categories'
  | 'suppliers'
  | 'deliveries';

type HomeActionConfig = {
  key: HomeActionKey;
  href: string;
  icon: LucideIcon;
};

export type HomePageAction = HomeActionConfig & {
  label: string;
  title: string;
  description: string;
};

// ========== Constants ==========

const userActions: HomeActionConfig[] = [
  { key: 'catalog', href: '/catalog', icon: Store },
  { key: 'cart', href: '/cart', icon: ShoppingCart },
  { key: 'orders', href: '/orders', icon: ClipboardList },
];

const adminActions: HomeActionConfig[] = [
  { key: 'adminDashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'products', href: '/admin/products', icon: Package },
  { key: 'adminOrders', href: '/admin/orders', icon: ClipboardList },
  { key: 'reports', href: '/admin/reports', icon: BarChart3 },
  { key: 'categories', href: '/admin/categories', icon: Tags },
  { key: 'suppliers', href: '/admin/suppliers', icon: Users },
  { key: 'deliveries', href: '/admin/deliveries', icon: Truck },
];

// ========== Helpers ==========

function getRoleLabelKey(roleName: AuthUser['roleName'] | undefined) {
  if (roleName === 'admin') {
    return 'admin';
  }

  if (roleName === 'user') {
    return 'user';
  }

  return 'unknown';
}

function getActionsForRole(roleName: AuthUser['roleName'] | undefined) {
  if (roleName === 'admin') {
    return adminActions;
  }

  if (roleName === 'user') {
    return userActions;
  }

  return [];
}

function getSectionTitleKey(roleName: AuthUser['roleName'] | undefined) {
  if (roleName === 'admin') {
    return 'adminTitle';
  }

  if (roleName === 'user') {
    return 'userTitle';
  }

  return 'unknownTitle';
}

function getSectionDescriptionKey(roleName: AuthUser['roleName'] | undefined) {
  if (roleName === 'admin') {
    return 'adminDescription';
  }

  if (roleName === 'user') {
    return 'userDescription';
  }

  return 'unknownDescription';
}

// ========== Hook ==========

export function useHomePage() {
  const t = useTranslations('Home');
  const user = useAuthSessionStore(state => state.user);

  const userRoleName = user?.roleName;
  const displayName = user?.fullName || user?.email || t('fallback.name');
  const roleLabelKey = getRoleLabelKey(userRoleName);
  const sectionTitleKey = getSectionTitleKey(userRoleName);
  const sectionDescriptionKey = getSectionDescriptionKey(userRoleName);
  const RoleIcon = userRoleName === 'admin' ? ShieldCheck : User;

  return {
    hero: {
      greeting: t('greeting', { name: displayName }),
      title: t('title'),
      subtitle: t('subtitle'),
      roleLabel: t(`role.${roleLabelKey}`),
      RoleIcon,
      isAdmin: userRoleName === 'admin',
    },
    section: {
      title: t(`sections.${sectionTitleKey}`),
      description: t(`sections.${sectionDescriptionKey}`),
    },
    actions: getActionsForRole(userRoleName).map(action => ({
      ...action,
      label: t(`actions.${action.key}.label`),
      title: t(`actions.${action.key}.title`),
      description: t(`actions.${action.key}.description`),
    })),
    cta: t('cta'),
    hint: t('hint'),
    fallbackDescription: t('fallback.description'),
  };
}
