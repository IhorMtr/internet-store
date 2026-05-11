'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  useAdminDeliveriesQuery,
  useAdminDeliveryDetailsQuery,
  useAdminProductsQuery,
  useAdminSuppliersQuery,
  useCreateDeliveryMutation,
} from '@/domains/admin/model/hooks';
import type { AdminDelivery, AdminDeliveryItem, CreateDeliveryInput } from '@/domains/admin/model/types';
import { formatCurrency, formatDate } from '@/domains/admin/lib/admin-utils';
import { Button } from '@/shared/ui/button';

// ========== Types ==========

type DeliveryFormValues = {
  supplierId: string;
  deliveryDate: string;
  invoiceNumber: string;
  items: Array<{
    productId: string;
    quantity: string;
    supplyPrice: string;
  }>;
};

// ========== Constants ==========

const today = new Date().toISOString().slice(0, 10);

// ========== Hook ==========

export function useAdminDeliveriesPage() {
  // ========== Translations ==========

  const locale = useLocale();
  const t = useTranslations('AdminDeliveries');

  // ========== State ==========

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);

  // ========== Queries ==========

  const deliveriesQuery = useAdminDeliveriesQuery();
  const suppliersQuery = useAdminSuppliersQuery();
  const productsQuery = useAdminProductsQuery({});
  const deliveryDetailsQuery = useAdminDeliveryDetailsQuery(selectedDeliveryId);

  // ========== Mutations ==========

  const createMutation = useCreateDeliveryMutation();

  // ========== Derived Data ==========

  const deliveries = deliveriesQuery.data?.data.deliveries ?? [];
  const suppliers = suppliersQuery.data?.data.suppliers ?? [];
  const products = productsQuery.data?.data.products ?? [];

  const supplierOptions = suppliers.map(supplier => ({
    label: supplier.name,
    value: String(supplier.supplierId),
  }));

  const productOptions = products.map(product => ({
    label: `${product.name} (#${product.productId})`,
    value: String(product.productId),
  }));

  const initialValues: DeliveryFormValues = {
    supplierId: '',
    deliveryDate: today,
    invoiceNumber: '',
    items: [{ productId: '', quantity: '1', supplyPrice: '0' }],
  };

  // ========== Table Columns ==========

  const deliveriesColumns = useMemo<Array<ColumnDef<AdminDelivery>>>(
    () => [
      {
        accessorKey: 'deliveryId',
        header: t('table.id'),
      },
      {
        accessorKey: 'supplierName',
        header: t('table.supplier'),
      },
      {
        accessorKey: 'deliveryDate',
        header: t('table.date'),
        cell: ({ row }) => (
          <span className="inline-block min-w-32 whitespace-nowrap">
            {formatDate(row.original.deliveryDate, locale)}
          </span>
        ),
      },
      {
        accessorKey: 'invoiceNumber',
        header: t('table.invoice'),
      },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) => (
          <Button size="sm" variant="ghost" onClick={() => setSelectedDeliveryId(row.original.deliveryId)}>
            {t('actions.details')}
          </Button>
        ),
      },
    ],
    [locale, t]
  );

  const detailItemsColumns = useMemo<Array<ColumnDef<AdminDeliveryItem>>>(
    () => [
      {
        accessorKey: 'productId',
        header: t('detailsTable.productId'),
      },
      {
        accessorKey: 'productName',
        header: t('detailsTable.productName'),
      },
      {
        accessorKey: 'quantity',
        header: t('detailsTable.quantity'),
      },
      {
        accessorKey: 'supplyPrice',
        header: t('detailsTable.price'),
        cell: ({ row }) => formatCurrency(row.original.supplyPrice, locale),
      },
    ],
    [locale, t]
  );

  // ========== Handlers ==========

  async function submitDelivery(values: DeliveryFormValues) {
    const payload: CreateDeliveryInput = {
      supplierId: Number(values.supplierId),
      deliveryDate: values.deliveryDate,
      invoiceNumber: values.invoiceNumber.trim(),
      items: values.items.map(item => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        supplyPrice: Number(item.supplyPrice),
      })),
    };

    await createMutation.mutateAsync(payload);
  }

  // ========== Return ==========

  return {
    t,
    locale,
    deliveries,
    deliveriesColumns,
    detailItemsColumns,
    initialValues,
    supplierOptions,
    productOptions,
    selectedDeliveryId,
    setSelectedDeliveryId,
    selectedDetails: deliveryDetailsQuery.data?.data,
    isDetailsLoading: deliveryDetailsQuery.isLoading,
    isDeliveriesLoading: deliveriesQuery.isLoading,
    submitDelivery,
    isCreatingDelivery: createMutation.isPending,
  };
}
