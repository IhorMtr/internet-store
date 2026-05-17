'use client';

import { AdminProductForm } from '@/domains/admin/ui/index';
import { useAdminProductsPage } from '@/page-components/admin/admin-products-page/use-admin-products-page';
import { ConfirmDialog, DataTable, Input, Select } from '@/shared/ui';

// ========== Component ==========

export function AdminProductsPage() {
  const {
    cancelEditing,
    categoryFilterOptions,
    categoryOptions,
    columns,
    commonT,
    confirmDelete,
    currentImageUrl,
    deleteTarget,
    formInitialValues,
    formMode,
    imagePreviewUrl,
    isImageRemoving,
    isDeleteDialogOpen,
    isDeleteSubmitting,
    isFormSubmitting,
    isTableLoading,
    removeProductImage,
    products,
    selectedImageFile,
    selectedImageError,
    selectImage,
    search,
    selectedCategoryId,
    setSearch,
    setSelectedCategoryId,
    submitProduct,
    t,
    closeDeleteDialog,
  } = useAdminProductsPage();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
      </div>

      <section className="rounded-xl border bg-surface p-4 shadow-soft">
        <h2 className="text-lg font-semibold text-primary">{t('filters.title')}</h2>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span>{t('filters.searchLabel')}</span>
            <Input
              placeholder={t('filters.searchPlaceholder')}
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span>{t('filters.categoryLabel')}</span>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} options={categoryFilterOptions} />
          </label>
        </div>
      </section>

      <section className="rounded-xl border bg-surface p-4 shadow-soft">
        <h2 className="text-lg font-semibold text-primary">
          {formMode === 'edit' ? t('form.editTitle') : t('form.createTitle')}
        </h2>

        <AdminProductForm
          categoryOptions={categoryOptions}
          currentImageUrl={currentImageUrl}
          imageErrorMessage={selectedImageError}
          imageFile={selectedImageFile}
          imagePreviewUrl={imagePreviewUrl}
          isImageRemoving={isImageRemoving}
          initialValues={formInitialValues}
          isSubmitting={isFormSubmitting}
          mode={formMode}
          onCancel={cancelEditing}
          onImageSelected={selectImage}
          onRemoveImage={removeProductImage}
          onSubmit={submitProduct}
        />
      </section>

      <DataTable
        columns={columns}
        data={products}
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
