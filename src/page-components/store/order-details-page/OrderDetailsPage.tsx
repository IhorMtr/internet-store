'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useOrderDetailsPage } from '@/page-components/store/order-details-page/use-order-details-page';
import { Button, ConfirmDialog, DataTable, StatusBadge } from '@/shared/ui';

// ========== Types ==========

type OrderDetailsPageProps = {
  orderId: number;
};

// ========== Component ==========

export function OrderDetailsPage({ orderId }: OrderDetailsPageProps) {
  // ========== State ==========

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // ========== Queries and Mutations ==========

  const {
    canPayOrCancel,
    effectiveShippingStatus,
    formatStoreCurrency,
    formatStoreDate,
    formatPaymentMethod,
    formatShippingService,
    getStoreStatusLabelKey,
    getStoreStatusTone,
    isCancellingOrder,
    isCancelled,
    isLoading,
    isPaid,
    isSubmittingPayment,
    itemColumns,
    locale,
    order,
    selectedPaymentMethod,
    statusT,
    submitCancelOrder,
    submitPayment,
    t,
  } = useOrderDetailsPage({ orderId });

  // ========== Derived Values ==========

  // ========== Render ==========

  if (isLoading) {
    return (
      <section className="rounded-lg border bg-surface p-6 text-sm text-muted shadow-soft">{t('loading')}</section>
    );
  }

  if (!order) {
    return (
      <section className="rounded-lg border bg-surface p-6 text-sm text-muted shadow-soft">{t('notFound')}</section>
    );
  }

  const paymentStatusForDisplay = order.payment?.status ?? (isCancelled ? 'CANCELLED' : 'PENDING');

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{t('title', { orderId: order.orderId })}</h1>
          <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
        </div>

        <Link href="/orders">
          <Button type="button" variant="secondary">
            {t('backToOrders')}
          </Button>
        </Link>
      </div>

      <section className="grid gap-3 rounded-lg border bg-surface p-4 shadow-soft md:grid-cols-2">
        <p className="text-sm text-muted">
          {t('meta.date')}: <span className="text-primary">{formatStoreDate(order.orderDate, locale)}</span>
        </p>
        <p className="text-sm text-muted">
          {t('meta.total')}: <span className="text-primary">{formatStoreCurrency(order.totalAmount, locale)}</span>
        </p>
        <p className="text-sm text-muted">
          {t('meta.orderStatus')}:{' '}
          <StatusBadge
            label={statusT(getStoreStatusLabelKey(order.status, 'order'))}
            tone={getStoreStatusTone(order.status)}
          />
        </p>
        <p className="text-sm text-muted">
          {t('meta.paymentStatus')}:{' '}
          <StatusBadge
            label={statusT(getStoreStatusLabelKey(paymentStatusForDisplay, 'payment'))}
            tone={getStoreStatusTone(paymentStatusForDisplay)}
          />
        </p>
        <p className="text-sm text-muted">
          {t('meta.shippingStatus')}:{' '}
          <StatusBadge
            label={statusT(getStoreStatusLabelKey(effectiveShippingStatus, 'shipment'))}
            tone={getStoreStatusTone(effectiveShippingStatus)}
          />
        </p>
        <p className="text-sm text-muted">
          {t('meta.paymentDate')}:{' '}
          <span className="text-primary">{formatStoreDate(order.payment?.paymentDate, locale)}</span>
        </p>
      </section>

      <DataTable
        columns={itemColumns}
        data={order.items}
        isLoading={false}
        loadingText={t('itemsTable.loading')}
        emptyText={t('itemsTable.empty')}
        getRowId={row => String(row.orderItemId)}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-surface p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-primary">{t('shipment.title')}</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-muted">{t('shipment.service')}</dt>
              <dd className="mt-1 text-primary">{formatShippingService(order.shipment?.shippingService)}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('shipment.address')}</dt>
              <dd className="mt-1 text-primary">{order.shipment?.shippingAddress ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('shipment.trackingNumber')}</dt>
              <dd className="mt-1 text-primary">
                {order.shipment?.trackingNumber || t('shipment.trackingNumberNotProvided')}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-surface p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-primary">{t('payment.title')}</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <p className="text-muted">{isPaid ? t('payment.paid') : t('payment.unpaid')}</p>
            <p className="text-primary">
              {order.payment?.amount
                ? formatStoreCurrency(order.payment.amount, locale)
                : formatStoreCurrency(order.totalAmount, locale)}
            </p>
            <p className="text-muted">
              {t('payment.methodLabel')}:{' '}
              <span className="text-primary">{formatPaymentMethod(selectedPaymentMethod)}</span>
            </p>
            <p className="text-muted">
              {t('payment.dateLabel')}:{' '}
              <span className="text-primary">{formatStoreDate(order.payment?.paymentDate, locale)}</span>
            </p>

            {canPayOrCancel ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void submitPayment()}
                  disabled={isSubmittingPayment || isCancellingOrder}
                >
                  {isSubmittingPayment ? t('payment.actions.paying') : t('payment.actions.pay')}
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setIsCancelDialogOpen(true)}
                  disabled={isSubmittingPayment || isCancellingOrder}
                >
                  {isCancellingOrder ? t('payment.actions.cancelling') : t('payment.actions.cancel')}
                </Button>
              </div>
            ) : null}

            {isCancelled ? <p className="text-sm text-danger">{t('payment.cancelledInfo')}</p> : null}
          </div>
        </section>
      </section>

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={() => {
          void submitCancelOrder().finally(() => {
            setIsCancelDialogOpen(false);
          });
        }}
        title={t('cancelDialog.title')}
        description={t('cancelDialog.description')}
        confirmLabel={t('cancelDialog.confirm')}
        cancelLabel={t('cancelDialog.cancel')}
        confirmVariant="danger"
        isConfirming={isCancellingOrder}
      />
    </section>
  );
}
