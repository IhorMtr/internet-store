'use client';

import { useTranslations } from 'next-intl';
import { useAdminSummaryQuery } from '@/domains/admin/model/hooks';

// ========== Constants ==========

const quickLinks = [
  { key: 'products', href: '/admin/products' },
  { key: 'deliveries', href: '/admin/deliveries' },
  { key: 'orders', href: '/admin/orders' },
  { key: 'reports', href: '/admin/reports' },
] as const;

// ========== Hook ==========

export function useAdminDashboardPage() {
  // ========== Translations ==========

  const t = useTranslations('AdminDashboard');
  const commonT = useTranslations('Admin');

  // ========== State ==========

  // This hook does not keep local state.

  // ========== Queries ==========

  const { data, isLoading } = useAdminSummaryQuery();

  // ========== Mutations ==========

  // Dashboard widgets are read-only and do not perform mutations.

  // ========== Derived Data ==========

  const summary = data?.data.summary;

  const cards = [
    {
      key: 'productsCount',
      value: summary?.productsCount ?? 0,
    },
    {
      key: 'categoriesCount',
      value: summary?.categoriesCount ?? 0,
    },
    {
      key: 'suppliersCount',
      value: summary?.suppliersCount ?? 0,
    },
    {
      key: 'ordersCount',
      value: summary?.ordersCount ?? 0,
    },
    {
      key: 'lowStockProductsCount',
      value: summary?.lowStockProductsCount ?? 0,
    },
    {
      key: 'availableProductsCount',
      value: summary?.availableProductsCount ?? 0,
    },
  ] as const;

  // ========== Table Columns ==========

  // Dashboard cards do not use table columns.

  // ========== Handlers ==========

  // This hook has no event handlers.

  // ========== Return ==========

  return {
    t,
    commonT,
    cards,
    quickLinks,
    isLoading,
  };
}
