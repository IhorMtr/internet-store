'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  useAdminOrderDetailsQuery,
  useCreateShipmentMutation,
  useRegisterPaymentMutation,
  useUpdateShipmentMutation,
} from '@/domains/admin/model/hooks';
import type { AdminOrderDetailsRow, PaymentInput, ShipmentInput } from '@/domains/admin/model/types';
import { formatCurrency, formatDate, formatDateTime, toNumber, toStatusTone } from '@/domains/admin/lib/admin-utils';

// ========== Types ==========

type ShipmentFormValues = {
  shippingService: string;
  trackingNumber: string;
  shippingAddress: string;
  shippingStatus: string;
};

type PaymentFormValues = {
  paymentMethod: string;
};

// ========== Hook ==========

export function useAdminOrderDetailsPage(orderId: number) {
  // ========== Translations ==========

  const locale = useLocale();
  const t = useTranslations('AdminOrderDetails');

  // ========== State ==========

  // This hook does not require local component state.

  // ========== Queries ==========

  const detailsQuery = useAdminOrderDetailsQuery(orderId);

  // ========== Mutations ==========

  const createShipmentMutation = useCreateShipmentMutation(orderId);
  const updateShipmentMutation = useUpdateShipmentMutation(orderId);
  const paymentMutation = useRegisterPaymentMutation(orderId);

  // ========== Derived Data ==========

  const detailsRows = detailsQuery.data?.data.details ?? [];
  const head = detailsRows[0];

  const shipmentInitialValues: ShipmentFormValues = {
    shippingService: head?.shipping_service ?? '',
    trackingNumber: head?.tracking_number ?? '',
    shippingAddress: head?.shipping_address ?? '',
    shippingStatus: head?.shipping_status ?? 'processing',
  };

  const paymentInitialValues: PaymentFormValues = {
    paymentMethod: '',
  };

  // ========== Table Columns ==========

  const itemColumns = useMemo<Array<ColumnDef<AdminOrderDetailsRow>>>(
    () => [
      {
        accessorKey: 'product_id',
        header: t('itemsTable.productId'),
      },
      {
        accessorKey: 'product_name',
        header: t('itemsTable.productName'),
      },
      {
        accessorKey: 'quantity',
        header: t('itemsTable.quantity'),
      },
      {
        accessorKey: 'sale_price',
        header: t('itemsTable.salePrice'),
        cell: ({ row }) => formatCurrency(row.original.sale_price, locale),
      },
      {
        accessorKey: 'item_discount',
        header: t('itemsTable.discount'),
        cell: ({ row }) => `${toNumber(row.original.item_discount)}%`,
      },
      {
        accessorKey: 'line_amount',
        header: t('itemsTable.lineAmount'),
        cell: ({ row }) => formatCurrency(row.original.line_amount, locale),
      },
    ],
    [locale, t]
  );

  // ========== Handlers ==========

  async function createShipment(values: ShipmentFormValues) {
    const payload: ShipmentInput = {
      shippingService: values.shippingService.trim(),
      trackingNumber: values.trackingNumber.trim(),
      shippingAddress: values.shippingAddress.trim(),
      shippingStatus: values.shippingStatus.trim(),
    };

    await createShipmentMutation.mutateAsync(payload);
  }

  async function updateShipment(values: ShipmentFormValues) {
    const payload: ShipmentInput = {
      shippingService: values.shippingService.trim(),
      trackingNumber: values.trackingNumber.trim(),
      shippingAddress: values.shippingAddress.trim(),
      shippingStatus: values.shippingStatus.trim(),
    };

    await updateShipmentMutation.mutateAsync(payload);
  }

  async function submitPayment(values: PaymentFormValues) {
    const payload: PaymentInput = {
      paymentMethod: values.paymentMethod.trim(),
    };

    await paymentMutation.mutateAsync(payload);
  }

  // ========== Return ==========

  return {
    t,
    locale,
    head,
    detailsRows,
    itemColumns,
    isDetailsLoading: detailsQuery.isLoading,
    shipmentInitialValues,
    paymentInitialValues,
    isCreatingShipment: createShipmentMutation.isPending,
    isUpdatingShipment: updateShipmentMutation.isPending,
    isSubmittingPayment: paymentMutation.isPending,
    createShipment,
    updateShipment,
    submitPayment,
    formatCurrency,
    formatDate,
    formatDateTime,
    toStatusTone,
  };
}
