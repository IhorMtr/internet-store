'use client';

import { formatDate } from '@/domains/admin/lib/admin-utils';
import { AdminDeliveryForm } from '@/domains/admin/ui/index';
import { useAdminDeliveriesPage } from '@/page-components/admin/admin-deliveries-page/use-admin-deliveries-page';
import { Button, DataTable } from '@/shared/ui';

// ========== Component ==========

export function AdminDeliveriesPage() {
  const {
    deliveries,
    deliveriesColumns,
    detailItemsColumns,
    initialValues,
    isCreatingDelivery,
    isDeliveriesLoading,
    isDetailsLoading,
    locale,
    productOptions,
    selectedDeliveryId,
    selectedDetails,
    setSelectedDeliveryId,
    submitDelivery,
    supplierOptions,
    t,
  } = useAdminDeliveriesPage();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
      </div>

      <section className="rounded-xl border bg-surface p-4 shadow-soft">
        <h2 className="text-lg font-semibold text-primary">{t('form.createTitle')}</h2>

        <AdminDeliveryForm
          initialValues={initialValues}
          isSubmitting={isCreatingDelivery}
          supplierOptions={supplierOptions}
          productOptions={productOptions}
          onSubmit={submitDelivery}
        />
      </section>

      <DataTable
        columns={deliveriesColumns}
        data={deliveries}
        isLoading={isDeliveriesLoading}
        loadingText={t('table.loading')}
        emptyText={t('table.empty')}
      />

      {selectedDeliveryId ? (
        <section className="space-y-3 rounded-xl border bg-surface p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">
              {t('detailsTitle', { deliveryId: selectedDeliveryId })}
            </h2>

            <Button size="sm" variant="ghost" onClick={() => setSelectedDeliveryId(null)}>
              {t('actions.closeDetails')}
            </Button>
          </div>

          {selectedDetails ? (
            <div className="space-y-3">
              <div className="grid gap-2 text-sm text-muted md:grid-cols-3">
                <p>
                  {t('detailsMeta.supplier')}:{' '}
                  <span className="text-primary">{selectedDetails.delivery.supplierName}</span>
                </p>
                <p>
                  {t('detailsMeta.date')}:{' '}
                  <span className="text-primary">{formatDate(selectedDetails.delivery.deliveryDate, locale)}</span>
                </p>
                <p>
                  {t('detailsMeta.invoice')}:{' '}
                  <span className="text-primary">{selectedDetails.delivery.invoiceNumber}</span>
                </p>
              </div>

              <DataTable
                columns={detailItemsColumns}
                data={selectedDetails.items}
                isLoading={isDetailsLoading}
                loadingText={t('detailsTable.loading')}
                emptyText={t('detailsTable.empty')}
                getRowId={(row, index) => `${row.productId}-${index}`}
              />
            </div>
          ) : (
            <p className="text-sm text-muted">
              {isDetailsLoading ? t('detailsTable.loading') : t('detailsTable.empty')}
            </p>
          )}
        </section>
      ) : null}
    </section>
  );
}
