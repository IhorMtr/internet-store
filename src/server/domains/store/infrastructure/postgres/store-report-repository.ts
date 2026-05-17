import { storeError } from '@/server/domains/store/domain/store-error';
import type { StoreRepository } from '@/server/domains/store/application/store-ports';
import { postgresDb } from '@/server/shared/db/postgres-pool';
import type {
  ReportSoldProductsRow,
  ReportTopCategoriesRow,
} from '@/server/domains/store/infrastructure/postgres/store-row-types';
import { toNumber } from '@/server/domains/store/infrastructure/postgres/store-sql-utils';
import { isRaisedException } from '@/server/domains/store/infrastructure/postgres/store-sql-errors';

// ===================== Report Methods =====================

export const postgresReportRepository: Pick<
  StoreRepository,
  'getSoldProductsByDate' | 'getTopCategoriesByPeriod' | 'getAdminSummary'
> = {
  async getSoldProductsByDate(date: string) {
    const result = await postgresDb.query<ReportSoldProductsRow>(
      `
        select
          product_id,
          product_name,
          total_quantity,
          total_amount
        from public.fn_sold_products_by_date($1)
      `,
      [date]
    );

    return result.rows.map(row => ({
      productId: row.product_id,
      productName: row.product_name,
      totalQuantity: row.total_quantity,
      totalAmount: toNumber(row.total_amount),
    }));
  },

  async getTopCategoriesByPeriod(dateFrom: string, dateTo: string) {
    try {
      const result = await postgresDb.query<ReportTopCategoriesRow>(
        `
          select
            category_id,
            category_name,
            total_quantity,
            total_amount
          from public.fn_top_categories_by_period($1, $2)
        `,
        [dateFrom, dateTo]
      );

      return result.rows.map(row => ({
        categoryId: row.category_id,
        categoryName: row.category_name,
        totalQuantity: row.total_quantity,
        totalAmount: toNumber(row.total_amount),
      }));
    } catch (error) {
      if (isRaisedException(error)) {
        throw storeError.create('VALIDATION_ERROR', 'store.validation.dateRangeInvalid', 400);
      }

      throw error;
    }
  },

  async getAdminSummary(lowStockThreshold: number) {
    const result = await postgresDb.query<{
      products_count: number;
      categories_count: number;
      suppliers_count: number;
      orders_count: number;
      low_stock_products_count: number;
      available_products_count: number;
    }>(
      `
        select
          (select count(*)::int from public.products) as products_count,
          (select count(*)::int from public.categories) as categories_count,
          (select count(*)::int from public.suppliers) as suppliers_count,
          (select count(*)::int from public.orders) as orders_count,
          (
            select count(*)::int
            from public.products
            where stock_quantity <= $1
          ) as low_stock_products_count,
          (select count(*)::int from public.v_available_products) as available_products_count
      `,
      [lowStockThreshold]
    );

    const row = result.rows[0];

    return {
      productsCount: row.products_count,
      categoriesCount: row.categories_count,
      suppliersCount: row.suppliers_count,
      ordersCount: row.orders_count,
      lowStockProductsCount: row.low_stock_products_count,
      availableProductsCount: row.available_products_count,
    };
  },
};
