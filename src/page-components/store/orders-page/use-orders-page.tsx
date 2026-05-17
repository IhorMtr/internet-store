'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatStoreCurrency, formatStoreDate } from '@/domains/store/lib/store-format';
import {
  getEffectiveStoreShippingStatus,
  getStoreStatusLabelKey,
  getStoreStatusTone,
} from '@/domains/store/lib/store-status';
import { useStoreOrdersQuery } from '@/domains/store/model/hooks';
import type { StoreOrder } from '@/domains/store/model/types';
import { createPaymentMethodLabels, getPaymentMethodLabel } from '@/shared/lib/payment-method';
import { Button, StatusBadge } from '@/shared/ui';

// ========== Hook ==========

export function useOrdersPage() {
  // ========== Translations ==========

  const locale = useLocale();
  const t = useTranslations('Orders');
  const statusT = useTranslations('Store');
  const paymentMethodT = useTranslations('PaymentMethods');

  // ========== Queries ==========

  const ordersQuery = useStoreOrdersQuery();

  // ========== Derived Values ==========

  const orders = ordersQuery.data?.data.orders ?? [];
  const paymentMethodLabels = createPaymentMethodLabels(key => paymentMethodT(key));

  // ========== Table Columns ==========

  const columns = useMemo<Array<ColumnDef<StoreOrder>>>(
    () => [
      {
        accessorKey: 'orderId',
        header: t('table.id'),
      },
      {
        accessorKey: 'orderDate',
        header: t('table.date'),
        cell: ({ row }) => formatStoreDate(row.original.orderDate, locale),
      },
      {
        accessorKey: 'status',
        header: t('table.status'),
        cell: ({ row }) => (
          <StatusBadge
            label={statusT(getStoreStatusLabelKey(row.original.status, 'order'))}
            tone={getStoreStatusTone(row.original.status)}
          />
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: t('table.total'),
        cell: ({ row }) => formatStoreCurrency(row.original.totalAmount, locale),
      },
      {
        accessorKey: 'paymentMethod',
        header: t('table.paymentMethod'),
        cell: ({ row }) => getPaymentMethodLabel(row.original.paymentMethod, paymentMethodLabels),
      },
      {
        accessorKey: 'paymentStatus',
        header: t('table.paymentStatus'),
        cell: ({ row }) => (
          <StatusBadge
            label={statusT(getStoreStatusLabelKey(row.original.paymentStatus, 'payment'))}
            tone={getStoreStatusTone(row.original.paymentStatus)}
          />
        ),
      },
      {
        accessorKey: 'shippingStatus',
        header: t('table.shippingStatus'),
        cell: ({ row }) => {
          const effectiveShippingStatus = getEffectiveStoreShippingStatus(
            row.original.status,
            row.original.shippingStatus
          );

          return (
            <StatusBadge
              label={statusT(getStoreStatusLabelKey(effectiveShippingStatus, 'shipment'))}
              tone={getStoreStatusTone(effectiveShippingStatus)}
            />
          );
        },
      },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) => (
          <Link href={`/orders/${row.original.orderId}`}>
            <Button type="button" size="sm" variant="secondary">
              {t('actions.open')}
            </Button>
          </Link>
        ),
      },
    ],
    [locale, paymentMethodLabels, statusT, t]
  );

  // ========== Return Values ==========

  return {
    t,
    orders,
    columns,
    isLoading: ordersQuery.isLoading,
  };
}
