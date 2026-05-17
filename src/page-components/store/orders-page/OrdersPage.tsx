'use client';

import { Link } from '@/i18n/navigation';
import { useOrdersPage } from '@/page-components/store/orders-page/use-orders-page';
import { Button, DataTable } from '@/shared/ui';

// ========== Component ==========

export function OrdersPage() {
  const { columns, isLoading, orders, t } = useOrdersPage();

  // ========== Render ==========

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
        </div>

        <Link href="/catalog">
          <Button type="button" variant="secondary">
            {t('goToCatalog')}
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        loadingText={t('table.loading')}
        emptyText={t('table.empty')}
        getRowId={row => String(row.orderId)}
      />
    </section>
  );
}
