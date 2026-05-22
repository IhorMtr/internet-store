'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  useAdminSuppliersQuery,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useUpdateSupplierMutation,
} from '@/domains/admin/model/hooks';
import type { AdminSupplier, SupplierInput } from '@/domains/admin/model/types';
import { Button } from '@/shared/ui/button';

// ========== Types ==========

type SupplierFormValues = {
  name: string;
  phoneNumber: string;
  email: string;
};

// ========== Hook ==========

export function useAdminSuppliersPage() {
  // ========== Translations ==========

  const t = useTranslations('AdminSuppliers');
  const commonT = useTranslations('Admin');

  // ========== State ==========

  const [editingSupplier, setEditingSupplier] = useState<AdminSupplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSupplier | null>(null);

  // ========== Queries ==========

  const suppliersQuery = useAdminSuppliersQuery();

  // ========== Mutations ==========

  const createMutation = useCreateSupplierMutation();
  const updateMutation = useUpdateSupplierMutation(editingSupplier?.supplierId ?? 0);
  const deleteMutation = useDeleteSupplierMutation();

  // ========== Derived Data ==========

  const suppliers = suppliersQuery.data?.data.suppliers ?? [];

  const formInitialValues: SupplierFormValues = {
    name: editingSupplier?.name ?? '',
    phoneNumber: editingSupplier?.phoneNumber ?? '',
    email: editingSupplier?.email ?? '',
  };

  const formMode: 'create' | 'edit' = editingSupplier ? 'edit' : 'create';

  // ========== Table Columns ==========

  const columns = useMemo<Array<ColumnDef<AdminSupplier>>>(
    () => [
      {
        accessorKey: 'supplierId',
        header: t('table.id'),
      },
      {
        accessorKey: 'name',
        header: t('table.name'),
      },
      {
        accessorKey: 'phoneNumber',
        header: t('table.phone'),
        cell: ({ row }) =>
          row.original.phoneNumber ? (
            <span className="inline-block min-w-40 whitespace-nowrap">{row.original.phoneNumber}</span>
          ) : (
            '-'
          ),
      },
      {
        accessorKey: 'email',
        header: t('table.email'),
        cell: ({ row }) => row.original.email || '-',
      },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditingSupplier(row.original)}>
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
    [deleteMutation.isPending, t]
  );

  // ========== Handlers ==========

  async function submitSupplier(values: SupplierFormValues) {
    const payload: SupplierInput = {
      name: values.name.trim(),
      phoneNumber: values.phoneNumber.trim() || null,
      email: values.email.trim() || null,
    };

    if (editingSupplier) {
      await updateMutation.mutateAsync(payload);
      toast.success(commonT('feedback.suppliers.updateSuccess'));
      setEditingSupplier(null);
      return;
    }

    await createMutation.mutateAsync(payload);
    toast.success(commonT('feedback.suppliers.createSuccess'));
  }

  function cancelEditing() {
    setEditingSupplier(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    await deleteMutation.mutateAsync(deleteTarget.supplierId);
    toast.success(commonT('feedback.suppliers.deleteSuccess'));

    if (editingSupplier?.supplierId === deleteTarget.supplierId) {
      setEditingSupplier(null);
    }

    setDeleteTarget(null);
  }

  // ========== Return ==========

  return {
    t,
    commonT,
    suppliers,
    columns,
    isTableLoading: suppliersQuery.isLoading,
    formInitialValues,
    formMode,
    isFormSubmitting: createMutation.isPending || updateMutation.isPending,
    submitSupplier,
    cancelEditing,
    deleteTarget,
    isDeleteDialogOpen: Boolean(deleteTarget),
    closeDeleteDialog: () => setDeleteTarget(null),
    confirmDelete,
    isDeleteSubmitting: deleteMutation.isPending,
  };
}
