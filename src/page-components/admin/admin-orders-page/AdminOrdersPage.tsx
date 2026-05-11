'use client';

import { useAdminOrdersPage } from '@/page-components/admin/admin-orders-page/use-admin-orders-page';
import { DataTable, Input, Select } from '@/shared/ui';

// ========== Component ==========

export function AdminOrdersPage() {
  const { columns, customerIdRaw, isOrdersLoading, orders, setCustomerIdRaw, setStatus, status, statusOptions, t } =
    useAdminOrdersPage();

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
            <span>{t('filters.statusLabel')}</span>
            <Select
              value={status}
              onValueChange={setStatus}
              options={statusOptions}
              placeholder={t('filters.statusPlaceholder')}
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span>{t('filters.customerIdLabel')}</span>
            <Input
              type="number"
              min="1"
              step="1"
              value={customerIdRaw}
              onChange={event => setCustomerIdRaw(event.target.value)}
              placeholder={t('filters.customerIdPlaceholder')}
            />
          </label>
        </div>
      </section>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isOrdersLoading}
        loadingText={t('table.loading')}
        emptyText={t('table.empty')}
      />
    </section>
  );
}
