'use client';

import { AdminSoldProductsReportForm, AdminTopCategoriesReportForm } from '@/domains/admin/ui/index';
import { useAdminReportsPage } from '@/page-components/admin/admin-reports-page/use-admin-reports-page';
import { DataTable } from '@/shared/ui';

// ========== Component ==========

export function AdminReportsPage() {
  const {
    isSoldProductsLoading,
    isTopCategoriesLoading,
    soldProductsColumns,
    soldProductsInitialValues,
    soldRows,
    submitSoldProductsForm,
    submitTopCategoriesForm,
    t,
    topCategoriesColumns,
    topCategoriesInitialValues,
    topRows,
  } = useAdminReportsPage();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
      </div>

      <section className="rounded-xl border bg-surface p-4 shadow-soft">
        <AdminSoldProductsReportForm initialValues={soldProductsInitialValues} onSubmit={submitSoldProductsForm} />

        <div className="mt-4">
          <DataTable
            columns={soldProductsColumns}
            data={soldRows}
            isLoading={isSoldProductsLoading}
            loadingText={t('soldProducts.table.loading')}
            emptyText={t('soldProducts.table.empty')}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-surface p-4 shadow-soft">
        <AdminTopCategoriesReportForm initialValues={topCategoriesInitialValues} onSubmit={submitTopCategoriesForm} />

        <div className="mt-4">
          <DataTable
            columns={topCategoriesColumns}
            data={topRows}
            isLoading={isTopCategoriesLoading}
            loadingText={t('topCategories.table.loading')}
            emptyText={t('topCategories.table.empty')}
          />
        </div>
      </section>
    </section>
  );
}
