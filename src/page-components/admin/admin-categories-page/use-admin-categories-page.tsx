'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  useAdminCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/domains/admin/model/hooks';
import type { AdminCategory, CategoryInput } from '@/domains/admin/model/types';
import { Button } from '@/shared/ui/button';

// ========== Types ==========

type CategoryFormValues = {
  categoryName: string;
  description: string;
};

// ========== Hook ==========

export function useAdminCategoriesPage() {
  // ========== Translations ==========

  const t = useTranslations('AdminCategories');
  const commonT = useTranslations('Admin');

  // ========== State ==========

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  // ========== Queries ==========

  const categoriesQuery = useAdminCategoriesQuery();

  // ========== Mutations ==========

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation(editingCategoryId ?? 0);
  const deleteMutation = useDeleteCategoryMutation();

  // ========== Derived Values ==========

  const categories = categoriesQuery.data?.data.categories ?? [];

  const editingCategory = categories.find(category => category.categoryId === editingCategoryId) ?? null;

  const formInitialValues: CategoryFormValues = {
    categoryName: editingCategory?.categoryName ?? '',
    description: editingCategory?.description ?? '',
  };

  const formMode: 'create' | 'edit' = editingCategoryId ? 'edit' : 'create';

  // ========== Table Columns ==========

  const columns = useMemo<Array<ColumnDef<AdminCategory>>>(
    () => [
      {
        accessorKey: 'categoryId',
        header: t('table.id'),
      },
      {
        accessorKey: 'categoryName',
        header: t('table.name'),
      },
      {
        accessorKey: 'description',
        header: t('table.description'),
        cell: ({ row }) => row.original.description || '-',
      },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingCategoryId(row.original.categoryId)}>
              {t('actions.edit')}
            </Button>

            <Button
              variant="danger"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTarget(row.original)}
            >
              {t('actions.delete')}
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation.isPending, t]
  );

  // ========== Handlers ==========

  async function handleSubmit(values: CategoryFormValues) {
    const payload: CategoryInput = {
      categoryName: values.categoryName.trim(),
      description: values.description.trim() || null,
    };

    if (editingCategoryId) {
      await updateMutation.mutateAsync(payload);
      setEditingCategoryId(null);
      return;
    }

    await createMutation.mutateAsync(payload);
  }

  function handleCancelEdit() {
    setEditingCategoryId(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    await deleteMutation.mutateAsync(deleteTarget.categoryId);

    if (deleteTarget.categoryId === editingCategoryId) {
      setEditingCategoryId(null);
    }

    setDeleteTarget(null);
  }

  // ========== Return Values ==========

  return {
    t,
    commonT,
    categories,
    columns,
    isTableLoading: categoriesQuery.isLoading,
    formInitialValues,
    formMode,
    isFormSubmitting: createMutation.isPending || updateMutation.isPending,
    onSubmit: handleSubmit,
    onCancelEdit: handleCancelEdit,
    deleteTarget,
    isDeleteDialogOpen: Boolean(deleteTarget),
    closeDeleteDialog: () => setDeleteTarget(null),
    confirmDelete,
    isDeleteSubmitting: deleteMutation.isPending,
  };
}
