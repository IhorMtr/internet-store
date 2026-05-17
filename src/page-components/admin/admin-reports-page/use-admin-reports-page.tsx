'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useAdminSoldProductsByDateQuery, useAdminTopCategoriesByPeriodQuery } from '@/domains/admin/model/hooks';
import type { SoldProductReportRow, TopCategoryReportRow } from '@/domains/admin/model/types';
import { formatCurrency } from '@/domains/admin/lib/admin-utils';
import type { TabsOption } from '@/shared/ui/tabs';

// ========== Types ==========

type SoldProductsReportFormValues = {
  date: string;
};

type TopCategoriesReportFormValues = {
  dateFrom: string;
  dateTo: string;
};

type AdminReportTab = 'soldProducts' | 'topCategories';

// ========== Constants ==========

const today = new Date();
const todayIso = today.toISOString().slice(0, 10);
const firstDayOfMonthIso = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);

// ========== Hook ==========

export function useAdminReportsPage() {
  // ========== Translations ==========

  const locale = useLocale();
  const t = useTranslations('AdminReports');

  // ========== State ==========

  const [soldDateSubmitted, setSoldDateSubmitted] = useState(todayIso);
  const [dateFromSubmitted, setDateFromSubmitted] = useState(firstDayOfMonthIso);
  const [dateToSubmitted, setDateToSubmitted] = useState(todayIso);
  const [activeReport, setActiveReport] = useState<AdminReportTab>('soldProducts');

  // ========== Queries ==========

  const soldProductsQuery = useAdminSoldProductsByDateQuery(soldDateSubmitted, Boolean(soldDateSubmitted));
  const topCategoriesQuery = useAdminTopCategoriesByPeriodQuery(
    dateFromSubmitted,
    dateToSubmitted,
    Boolean(dateFromSubmitted && dateToSubmitted)
  );

  // ========== Mutations ==========

  // This hook is read-only and only updates local filter state.

  // ========== Derived Values ==========

  const soldRows = soldProductsQuery.data?.data.rows ?? [];
  const topRows = topCategoriesQuery.data?.data.rows ?? [];
  const reportTabs = useMemo<Array<TabsOption<AdminReportTab>>>(
    () => [
      { label: t('tabs.soldProducts'), value: 'soldProducts' },
      { label: t('tabs.topCategories'), value: 'topCategories' },
    ],
    [t]
  );

  // ========== Table Columns ==========

  const soldProductsColumns = useMemo<Array<ColumnDef<SoldProductReportRow>>>(
    () => [
      {
        accessorKey: 'productId',
        header: t('soldProducts.table.productId'),
      },
      {
        accessorKey: 'productName',
        header: t('soldProducts.table.productName'),
      },
      {
        accessorKey: 'totalQuantity',
        header: t('soldProducts.table.totalQuantity'),
      },
      {
        accessorKey: 'totalAmount',
        header: t('soldProducts.table.totalAmount'),
        cell: ({ row }) => formatCurrency(row.original.totalAmount, locale),
      },
    ],
    [locale, t]
  );

  const topCategoriesColumns = useMemo<Array<ColumnDef<TopCategoryReportRow>>>(
    () => [
      {
        accessorKey: 'categoryId',
        header: t('topCategories.table.categoryId'),
      },
      {
        accessorKey: 'categoryName',
        header: t('topCategories.table.categoryName'),
      },
      {
        accessorKey: 'totalQuantity',
        header: t('topCategories.table.totalQuantity'),
      },
      {
        accessorKey: 'totalAmount',
        header: t('topCategories.table.totalAmount'),
        cell: ({ row }) => formatCurrency(row.original.totalAmount, locale),
      },
    ],
    [locale, t]
  );

  // ========== Handlers ==========

  async function submitSoldProductsForm(values: SoldProductsReportFormValues) {
    setSoldDateSubmitted(values.date);
  }

  async function submitTopCategoriesForm(values: TopCategoriesReportFormValues) {
    setDateFromSubmitted(values.dateFrom);
    setDateToSubmitted(values.dateTo);
  }

  // ========== Return Values ==========

  return {
    t,
    activeReport,
    setActiveReport,
    reportTabs,
    soldRows,
    topRows,
    soldProductsColumns,
    topCategoriesColumns,
    soldProductsInitialValues: { date: soldDateSubmitted },
    topCategoriesInitialValues: {
      dateFrom: dateFromSubmitted,
      dateTo: dateToSubmitted,
    },
    submitSoldProductsForm,
    submitTopCategoriesForm,
    isSoldProductsLoading: soldProductsQuery.isLoading || soldProductsQuery.isFetching,
    isTopCategoriesLoading: topCategoriesQuery.isLoading || topCategoriesQuery.isFetching,
  };
}
