'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/domains/admin/api/admin.api';
import { adminQueryKeys } from '@/domains/admin/lib/admin-query-keys';

// ========== Hooks ==========
export function useAdminSoldProductsByDateQuery(date: string, enabled: boolean) {
  return useQuery({
    queryKey: adminQueryKeys.soldProductsReport(date),
    queryFn: () => adminApi.getSoldProductsByDate(date),
    enabled,
  });
}

export function useAdminTopCategoriesByPeriodQuery(dateFrom: string, dateTo: string, enabled: boolean) {
  return useQuery({
    queryKey: adminQueryKeys.topCategoriesReport(dateFrom, dateTo),
    queryFn: () => adminApi.getTopCategoriesByPeriod(dateFrom, dateTo),
    enabled,
  });
}
