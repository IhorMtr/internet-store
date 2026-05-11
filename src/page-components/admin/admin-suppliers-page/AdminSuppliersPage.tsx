'use client';

import { AdminSupplierForm } from '@/domains/admin/ui/index';
import { useAdminSuppliersPage } from '@/page-components/admin/admin-suppliers-page/use-admin-suppliers-page';
import { ConfirmDialog, DataTable } from '@/shared/ui';

// ========== Component ==========

export function AdminSuppliersPage() {
  const {
    cancelEditing,
    columns,
    commonT,
    confirmDelete,
    deleteTarget,
    formInitialValues,
    formMode,
    isDeleteDialogOpen,
    isDeleteSubmitting,
    isFormSubmitting,
    isTableLoading,
    submitSupplier,
    suppliers,
    t,
    closeDeleteDialog,
  } = useAdminSuppliersPage();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
      </div>

      <section className="rounded-xl border bg-surface p-4 shadow-soft">
        <h2 className="text-lg font-semibold text-primary">
          {formMode === 'edit' ? t('form.editTitle') : t('form.createTitle')}
        </h2>

        <AdminSupplierForm
          initialValues={formInitialValues}
          isSubmitting={isFormSubmitting}
          mode={formMode}
          onCancel={cancelEditing}
          onSubmit={submitSupplier}
        />
      </section>

      <DataTable
        columns={columns}
        data={suppliers}
        isLoading={isTableLoading}
        loadingText={t('table.loading')}
        emptyText={t('table.empty')}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={open => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
        onConfirm={confirmDelete}
        title={t('deleteDialog.title')}
        description={t('deleteDialog.description', { name: deleteTarget?.name ?? '' })}
        confirmLabel={commonT('confirmDialog.confirm')}
        cancelLabel={commonT('confirmDialog.cancel')}
        isConfirming={isDeleteSubmitting}
      />
    </section>
  );
}
