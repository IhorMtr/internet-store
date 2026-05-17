'use client';

import { AdminSoldProductsReportForm, AdminTopCategoriesReportForm } from '@/domains/admin/ui/index';
import { useAdminReportsPage } from '@/page-components/admin/admin-reports-page/use-admin-reports-page';
import { DataTable, Tabs } from '@/shared/ui';

// ========== Component ==========

export function AdminReportsPage() {
  const {
    activeReport,
    isSoldProductsLoading,
    isTopCategoriesLoading,
    reportTabs,
    setActiveReport,
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

      <section className="space-y-4 rounded-xl border bg-surface p-4 shadow-soft">
        <Tabs value={activeReport} onValueChange={setActiveReport} options={reportTabs} />

        <div className="border-b border-border/70 pb-4">
          <h2 className="text-lg font-semibold text-primary">
            {activeReport === 'soldProducts' ? t('soldProducts.title') : t('topCategories.title')}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            {activeReport === 'soldProducts' ? t('soldProducts.description') : t('topCategories.description')}
          </p>
        </div>

        {activeReport === 'soldProducts' ? (
          <div className="space-y-4">
            <AdminSoldProductsReportForm
              initialValues={soldProductsInitialValues}
              isSubmitting={isSoldProductsLoading}
              onSubmit={submitSoldProductsForm}
            />

            <DataTable
              columns={soldProductsColumns}
              data={soldRows}
              isLoading={isSoldProductsLoading}
              loadingText={t('soldProducts.table.loading')}
              emptyText={t('soldProducts.table.empty')}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <AdminTopCategoriesReportForm
              initialValues={topCategoriesInitialValues}
              isSubmitting={isTopCategoriesLoading}
              onSubmit={submitTopCategoriesForm}
            />

            <DataTable
              columns={topCategoriesColumns}
              data={topRows}
              isLoading={isTopCategoriesLoading}
              loadingText={t('topCategories.table.loading')}
              emptyText={t('topCategories.table.empty')}
            />
          </div>
        )}
      </section>
    </section>
  );
}
