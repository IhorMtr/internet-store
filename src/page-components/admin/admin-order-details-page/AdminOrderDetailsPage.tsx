'use client';

import { useTranslations } from 'next-intl';
import { getAdminStatusLabelKey } from '@/domains/admin/lib/admin-utils';
import { AdminPaymentForm, AdminShipmentForm } from '@/domains/admin/ui/index';
import { useAdminOrderDetailsPage } from '@/page-components/admin/admin-order-details-page/use-admin-order-details-page';
import { DataTable, StatusBadge } from '@/shared/ui';

type AdminOrderDetailsPageProps = {
  orderId: number;
};

// ========== Component ==========

export function AdminOrderDetailsPage({ orderId }: AdminOrderDetailsPageProps) {
  const adminT = useTranslations('Admin');

  const {
    createShipment,
    detailsRows,
    effectiveShippingStatus,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatPaymentMethod,
    head,
    isCreatingShipment,
    isDetailsLoading,
    isSubmittingPayment,
    isUpdatingShipment,
    itemColumns,
    locale,
    paymentInitialValues,
    shipmentInitialValues,
    submitPayment,
    t,
    toStatusTone,
    updateShipment,
  } = useAdminOrderDetailsPage(orderId);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-primary">{t('title', { orderId })}</h1>
        <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
      </div>

      {head ? (
        <section className="grid gap-3 rounded-xl border bg-surface p-4 shadow-soft md:grid-cols-2">
          <p className="text-sm text-muted">
            {t('meta.customer')}: <span className="text-primary">{head.customer_name}</span>
          </p>
          <p className="text-sm text-muted">
            {t('meta.customerId')}: <span className="text-primary">{head.customer_id}</span>
          </p>
          <p className="text-sm text-muted">
            {t('meta.date')}: <span className="text-primary">{formatDateTime(head.order_date, locale)}</span>
          </p>
          <p className="text-sm text-muted">
            {t('meta.total')}: <span className="text-primary">{formatCurrency(head.total_amount, locale)}</span>
          </p>
          <p className="text-sm text-muted">
            {t('meta.orderStatus')}:{' '}
            <StatusBadge
              label={adminT(getAdminStatusLabelKey(head.order_status, 'order'))}
              tone={toStatusTone(head.order_status)}
            />
          </p>
          <p className="text-sm text-muted">
            {t('meta.shippingStatus')}:{' '}
            <StatusBadge
              label={adminT(getAdminStatusLabelKey(effectiveShippingStatus, 'shipment'))}
              tone={toStatusTone(effectiveShippingStatus)}
            />
          </p>
          <p className="text-sm text-muted">
            {t('meta.paymentStatus')}:{' '}
            <StatusBadge
              label={adminT(getAdminStatusLabelKey(head.payment_status, 'payment'))}
              tone={toStatusTone(head.payment_status)}
            />
          </p>
          <p className="text-sm text-muted">
            {t('meta.paymentMethod')}: <span className="text-primary">{formatPaymentMethod(head.payment_method)}</span>
          </p>
          <p className="text-sm text-muted">
            {t('meta.paymentDate')}: <span className="text-primary">{formatDate(head.payment_date, locale)}</span>
          </p>
        </section>
      ) : null}

      <DataTable
        columns={itemColumns}
        data={detailsRows}
        isLoading={isDetailsLoading}
        loadingText={t('itemsTable.loading')}
        emptyText={t('itemsTable.empty')}
        getRowId={row => String(row.order_item_id)}
      />

      <section className="rounded-xl border bg-surface p-4 shadow-soft">
        <h2 className="text-lg font-semibold text-primary">{t('shipmentForm.title')}</h2>

        <AdminShipmentForm
          initialValues={shipmentInitialValues}
          isCreating={isCreatingShipment}
          isUpdating={isUpdatingShipment}
          onCreate={createShipment}
          onUpdate={updateShipment}
        />
      </section>

      <section className="rounded-xl border bg-surface p-4 shadow-soft">
        <h2 className="text-lg font-semibold text-primary">{t('paymentForm.title')}</h2>

        <AdminPaymentForm
          initialValues={paymentInitialValues}
          isSubmitting={isSubmittingPayment}
          onSubmit={submitPayment}
        />
      </section>
    </section>
  );
}
