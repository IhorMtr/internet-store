'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { formatStoreCurrency, formatStoreDate } from '@/domains/store/lib/store-format';
import {
  getEffectiveStoreShippingStatus,
  getStoreStatusLabelKey,
  getStoreStatusTone,
  isStoreOrderPaid,
} from '@/domains/store/lib/store-status';
import { useCancelStoreOrderMutation, usePayStoreOrderMutation, useStoreOrderQuery } from '@/domains/store/model/hooks';
import type { StoreOrderItem } from '@/domains/store/model/types';
import { createPaymentMethodLabels, getPaymentMethodLabel } from '@/shared/lib/payment-method';
import { ProductImage } from '@/shared/ui/product-image/ProductImage';

// ========== Types ==========

type UseOrderDetailsPageArgs = {
  orderId: number;
};

// ========== Hook ==========

export function useOrderDetailsPage({ orderId }: UseOrderDetailsPageArgs) {
  // ========== Hooks ==========

  const locale = useLocale();
  const t = useTranslations('OrderDetails');
  const statusT = useTranslations('Store');
  const paymentMethodT = useTranslations('PaymentMethods');
  const checkoutT = useTranslations('Checkout');

  // ========== Queries ==========

  const orderQuery = useStoreOrderQuery(orderId);

  // ========== Mutations ==========

  const payOrderMutation = usePayStoreOrderMutation(orderId);
  const cancelOrderMutation = useCancelStoreOrderMutation(orderId);

  // ========== Derived Data ==========

  const order = orderQuery.data?.data.order ?? null;
  const paymentMethodLabels = createPaymentMethodLabels(key => paymentMethodT(key));
  const selectedPaymentMethod = order?.payment?.paymentMethod ?? order?.selectedPaymentMethod ?? null;
  const isPaid = isStoreOrderPaid(order?.payment?.status ?? null, order?.payment ?? null);
  const effectiveShippingStatus = getEffectiveStoreShippingStatus(
    order?.status ?? null,
    order?.shipment?.shippingStatus ?? null
  );
  const isCancelled = getStoreStatusLabelKey(order?.status ?? null, 'order') === 'statuses.order.CANCELLED';
  const canPayOrCancel = Boolean(order) && !isPaid && !isCancelled;

  const itemColumns = useMemo<Array<ColumnDef<StoreOrderItem>>>(
    () => [
      {
        accessorKey: 'productName',
        header: t('itemsTable.product'),
        cell: ({ row }) => (
          <div className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-2">
            <ProductImage
              src={row.original.productImageUrl}
              alt={row.original.productName}
              fallbackLabel={t('itemsTable.noImage')}
              className="aspect-square h-10 w-10"
              sizes="40px"
            />
            <span className="truncate">{row.original.productName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: t('itemsTable.quantity'),
      },
      {
        accessorKey: 'salePrice',
        header: t('itemsTable.salePrice'),
        cell: ({ row }) => formatStoreCurrency(row.original.salePrice, locale),
      },
      {
        accessorKey: 'discount',
        header: t('itemsTable.discount'),
        cell: ({ row }) => `${row.original.discount}%`,
      },
      {
        accessorKey: 'lineAmount',
        header: t('itemsTable.lineAmount'),
        cell: ({ row }) => formatStoreCurrency(row.original.lineAmount, locale),
      },
    ],
    [locale, t]
  );

  // ========== Handlers ==========

  function formatPaymentMethod(value: string | null | undefined) {
    return getPaymentMethodLabel(value, paymentMethodLabels);
  }

  function formatShippingService(value: string | null | undefined) {
    if (value === 'nova_poshta') {
      return checkoutT('form.shippingServiceOptions.novaPoshta');
    }

    if (value === 'ukrposhta') {
      return checkoutT('form.shippingServiceOptions.ukrposhta');
    }

    if (value === 'meest') {
      return checkoutT('form.shippingServiceOptions.meest');
    }

    return value || '-';
  }

  async function submitPayment() {
    await payOrderMutation.mutateAsync({});
  }

  async function submitCancelOrder() {
    await cancelOrderMutation.mutateAsync();
  }

  // ========== Return ==========

  return {
    t,
    statusT,
    locale,
    order,
    effectiveShippingStatus,
    selectedPaymentMethod,
    itemColumns,
    isLoading: orderQuery.isLoading,
    isPaid,
    isCancelled,
    canPayOrCancel,
    isSubmittingPayment: payOrderMutation.isPending,
    isCancellingOrder: cancelOrderMutation.isPending,
    formatStoreCurrency,
    formatStoreDate,
    formatPaymentMethod,
    formatShippingService,
    submitPayment,
    submitCancelOrder,
    getStoreStatusLabelKey,
    getStoreStatusTone,
  };
}
