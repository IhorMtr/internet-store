import type { ProductListFilters, StoreRepository } from '@/server/domains/store/application/store-ports';
import { postgresDb } from '@/server/shared/db/postgres-pool';
import { mapCategory, mapProduct } from '@/server/domains/store/infrastructure/postgres/store-mappers';
import type { CategoryRow, ProductRow } from '@/server/domains/store/infrastructure/postgres/store-row-types';

// ===================== User Catalog Methods =====================

export const postgresUserCatalogRepository: Pick<
  StoreRepository,
  'listCatalogCategories' | 'listAvailableProducts' | 'getAvailableProductById'
> = {
  async listCatalogCategories() {
    const result = await postgresDb.query<CategoryRow>(
      `
        select distinct
          c.category_id,
          c.category_name,
          c.description
        from public.categories as c
        inner join public.v_available_products as ap
          on ap.category_id = c.category_id
        order by c.category_name asc
      `
    );

    return result.rows.map(mapCategory);
  },

  async listAvailableProducts(filters: ProductListFilters) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.search) {
      values.push(`%${filters.search}%`);
      conditions.push(`ap.name ilike $${values.length}`);
    }

    if (filters.categoryId) {
      values.push(filters.categoryId);
      conditions.push(`ap.category_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';

    const result = await postgresDb.query<ProductRow>(
      `
        select
          ap.product_id,
          ap.category_id,
          ap.name,
          ap.price,
          ap.stock_quantity,
          ap.discount,
          ap.description,
          p.image_url,
          p.image_public_id
        from public.v_available_products as ap
        inner join public.products as p
          on p.product_id = ap.product_id
        ${whereClause}
        order by ap.name asc
      `,
      values
    );

    return result.rows.map(mapProduct);
  },

  async getAvailableProductById(productId: number) {
    const result = await postgresDb.query<ProductRow>(
      `
        select
          ap.product_id,
          ap.category_id,
          ap.name,
          ap.price,
          ap.stock_quantity,
          ap.discount,
          ap.description,
          p.image_url,
          p.image_public_id
        from public.v_available_products as ap
        inner join public.products as p
          on p.product_id = ap.product_id
        where ap.product_id = $1
        limit 1
      `,
      [productId]
    );

    const row = result.rows[0];

    return row ? mapProduct(row) : null;
  },
};
