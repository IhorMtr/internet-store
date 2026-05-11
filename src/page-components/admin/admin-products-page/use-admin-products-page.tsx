'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  useAdminCategoriesQuery,
  useAdminProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from '@/domains/admin/model/hooks';
import type { AdminProduct, ProductInput } from '@/domains/admin/model/types';
import { formatCurrency } from '@/domains/admin/lib/admin-utils';
import { Button } from '@/shared/ui/button';

// ========== Types ==========

type ProductFormValues = {
  categoryId: string;
  name: string;
  price: string;
  stockQuantity: string;
  discount: string;
  description: string;
};

// ========== Constants ==========

const ALL_CATEGORIES_VALUE = '__all__';

// ========== Hook ==========

export function useAdminProductsPage() {
  // ========== Translations ==========

  const locale = useLocale();
  const t = useTranslations('AdminProducts');
  const commonT = useTranslations('Admin');

  // ========== State ==========

  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORIES_VALUE);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  // ========== Queries ==========

  const categoriesQuery = useAdminCategoriesQuery();
  const productsQuery = useAdminProductsQuery({
    search: search.trim() || null,
    categoryId: selectedCategoryId === ALL_CATEGORIES_VALUE ? null : Number(selectedCategoryId),
  });

  // ========== Mutations ==========

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation(editingProduct?.productId ?? 0);
  const deleteMutation = useDeleteProductMutation();

  // ========== Derived Data ==========

  const categories = categoriesQuery.data?.data.categories ?? [];
  const products = productsQuery.data?.data.products ?? [];

  const categoryFilterOptions = [
    { label: t('filters.allCategories'), value: ALL_CATEGORIES_VALUE },
    ...categories.map(category => ({
      label: category.categoryName,
      value: String(category.categoryId),
    })),
  ];

  const categoryOptions = categories.map(category => ({
    label: category.categoryName,
    value: String(category.categoryId),
  }));

  const formInitialValues: ProductFormValues = {
    categoryId: editingProduct ? String(editingProduct.categoryId) : '',
    name: editingProduct?.name ?? '',
    price: editingProduct ? String(editingProduct.price) : '0',
    stockQuantity: editingProduct ? String(editingProduct.stockQuantity) : '0',
    discount: editingProduct ? String(editingProduct.discount) : '0',
    description: editingProduct?.description ?? '',
  };

  const formMode: 'create' | 'edit' = editingProduct ? 'edit' : 'create';

  // ========== Table Columns ==========

  const columns = useMemo<Array<ColumnDef<AdminProduct>>>(
    () => [
      {
        accessorKey: 'productId',
        header: t('table.id'),
      },
      {
        accessorKey: 'name',
        header: t('table.name'),
      },
      {
        accessorKey: 'categoryId',
        header: t('table.categoryId'),
      },
      {
        accessorKey: 'price',
        header: t('table.price'),
        cell: ({ row }) => formatCurrency(row.original.price, locale),
      },
      {
        accessorKey: 'stockQuantity',
        header: t('table.stock'),
      },
      {
        accessorKey: 'discount',
        header: t('table.discount'),
        cell: ({ row }) => `${row.original.discount}%`,
      },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditingProduct(row.original)}>
              {t('actions.edit')}
            </Button>

            <Button
              size="sm"
              variant="danger"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTarget(row.original)}
            >
              {t('actions.delete')}
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation.isPending, locale, t]
  );

  // ========== Handlers ==========

  async function submitProduct(values: ProductFormValues) {
    const payload: ProductInput = {
      categoryId: Number(values.categoryId),
      name: values.name.trim(),
      price: Number(values.price),
      stockQuantity: Number(values.stockQuantity),
      discount: Number(values.discount),
      description: values.description.trim() || null,
    };

    if (editingProduct) {
      await updateMutation.mutateAsync(payload);
      setEditingProduct(null);
      return;
    }

    await createMutation.mutateAsync(payload);
  }

  function cancelEditing() {
    setEditingProduct(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    await deleteMutation.mutateAsync(deleteTarget.productId);

    if (editingProduct?.productId === deleteTarget.productId) {
      setEditingProduct(null);
    }

    setDeleteTarget(null);
  }

  // ========== Return ==========

  return {
    t,
    commonT,
    products,
    columns,
    search,
    selectedCategoryId,
    setSearch,
    setSelectedCategoryId,
    categoryFilterOptions,
    categoryOptions,
    isTableLoading: productsQuery.isLoading,
    isFormSubmitting: createMutation.isPending || updateMutation.isPending,
    formMode,
    formInitialValues,
    submitProduct,
    cancelEditing,
    deleteTarget,
    isDeleteDialogOpen: Boolean(deleteTarget),
    closeDeleteDialog: () => setDeleteTarget(null),
    confirmDelete,
    isDeleteSubmitting: deleteMutation.isPending,
  };
}
