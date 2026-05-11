'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useAdminOrdersQuery } from '@/domains/admin/model/hooks';
import type { AdminOrderListItem, OrdersFilters } from '@/domains/admin/model/types';
import { Link } from '@/i18n/navigation';
import { formatCurrency, formatDateTime, getAdminStatusLabelKey, toStatusTone } from '@/domains/admin/lib/admin-utils';
import type { SelectOption } from '@/shared/ui/select';
import { StatusBadge } from '@/shared/ui/status-badge';

// ========== Constants ==========

const ALL_ORDER_STATUSES_VALUE = '__all__';

// ========== Hook ==========

export function useAdminOrdersPage() {
  // ========== Translations ==========

  const locale = useLocale();
  const t = useTranslations('AdminOrders');
  const adminT = useTranslations('Admin');

  // ========== State ==========

  const [status, setStatus] = useState(ALL_ORDER_STATUSES_VALUE);
  const [customerIdRaw, setCustomerIdRaw] = useState('');

  // ========== Derived Data ==========

  const statusOptions: SelectOption[] = [
    { label: t('filters.allStatuses'), value: ALL_ORDER_STATUSES_VALUE },
    { label: t('filters.statusOptions.created'), value: 'Created' },
    { label: t('filters.statusOptions.processing'), value: 'Processing' },
    { label: t('filters.statusOptions.completed'), value: 'Completed' },
    { label: t('filters.statusOptions.cancelled'), value: 'Cancelled' },
    { label: t('filters.statusOptions.pending'), value: 'Pending' },
  ];

  const filters: OrdersFilters = {
    status: status === ALL_ORDER_STATUSES_VALUE ? null : status.trim() || null,
    customerId: customerIdRaw ? Number(customerIdRaw) || null : null,
  };

  // ========== Queries ==========

  const ordersQuery = useAdminOrdersQuery(filters);
  const orders = ordersQuery.data?.data.orders ?? [];

  // ========== Mutations ==========

  // This hook is read-only and does not issue mutations.

  // ========== Table Columns ==========

  const columns = useMemo<Array<ColumnDef<AdminOrderListItem>>>(
    () => [
      {
        accessorKey: 'orderId',
        header: t('table.id'),
      },
      {
        accessorKey: 'customerName',
        header: t('table.customer'),
      },
      {
        accessorKey: 'orderDate',
        header: t('table.date'),
        cell: ({ row }) => (
          <span className="inline-block min-w-40 whitespace-nowrap">
            {formatDateTime(row.original.orderDate, locale)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('table.status'),
        cell: ({ row }) => (
          <StatusBadge
            label={adminT(getAdminStatusLabelKey(row.original.status, 'order'))}
            tone={toStatusTone(row.original.status)}
          />
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: t('table.total'),
        cell: ({ row }) => formatCurrency(row.original.totalAmount, locale),
      },
      {
        accessorKey: 'paymentMethod',
        header: t('table.paymentMethod'),
        cell: ({ row }) => row.original.paymentMethod || '-',
      },
      {
        accessorKey: 'shippingStatus',
        header: t('table.shippingStatus'),
        cell: ({ row }) => (
          <StatusBadge
            label={adminT(getAdminStatusLabelKey(row.original.shippingStatus, 'shipment'))}
            tone={toStatusTone(row.original.shippingStatus)}
          />
        ),
      },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) => (
          <Link
            href={`/admin/orders/${row.original.orderId}`}
            className="inline-flex rounded-md px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-surface-raised"
          >
            {t('actions.open')}
          </Link>
        ),
      },
    ],
    [adminT, locale, t]
  );

  // ========== Handlers ==========

  // This hook exposes state setters directly and has no extra handlers.

  // ========== Return ==========

  return {
    t,
    status,
    setStatus,
    customerIdRaw,
    setCustomerIdRaw,
    columns,
    orders,
    statusOptions,
    isOrdersLoading: ordersQuery.isLoading,
  };
}
