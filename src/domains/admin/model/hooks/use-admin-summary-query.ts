'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/domains/admin/api/admin.api';
import { adminQueryKeys } from '@/domains/admin/lib/admin-query-keys';

// ========== Hook ==========
export function useAdminSummaryQuery() {
  return useQuery({
    queryKey: adminQueryKeys.summary,
    queryFn: adminApi.getSummary,
  });
}
