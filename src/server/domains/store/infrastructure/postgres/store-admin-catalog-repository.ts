import { storeError } from '@/server/domains/store/domain/store-error';
import type {
  CategoryInput,
  ProductInput,
  ProductListFilters,
  StoreRepository,
  SupplierInput,
} from '@/server/domains/store/application/store-ports';
import { postgresDb } from '@/server/shared/db/postgres-pool';
import { mapCategory, mapProduct, mapSupplier } from '@/server/domains/store/infrastructure/postgres/store-mappers';
import type {
  CategoryRow,
  ProductRow,
  SupplierRow,
} from '@/server/domains/store/infrastructure/postgres/store-row-types';
import { isForeignKeyError } from '@/server/domains/store/infrastructure/postgres/store-sql-errors';

// ===================== Category Methods =====================

export const postgresAdminCatalogRepository: Pick<
  StoreRepository,
  | 'listCategories'
  | 'createCategory'
  | 'getCategoryById'
  | 'updateCategory'
  | 'deleteCategory'
  | 'listProducts'
  | 'createProduct'
  | 'getProductById'
  | 'updateProduct'
  | 'getProductImageMeta'
  | 'updateProductImage'
  | 'clearProductImage'
  | 'deleteProduct'
  | 'listSuppliers'
  | 'createSupplier'
  | 'getSupplierById'
  | 'updateSupplier'
  | 'deleteSupplier'
> = {
  // ===================== Category Methods =====================

  async listCategories() {
    const result = await postgresDb.query<CategoryRow>(
      `
        select
          category_id,
          category_name,
          description
        from public.categories
        order by category_name asc
      `
    );

    return result.rows.map(mapCategory);
  },

  async createCategory(input: CategoryInput) {
    const result = await postgresDb.query<CategoryRow>(
      `
        insert into public.categories (
          category_name,
          description
        )
        values ($1, $2)
        returning
          category_id,
          category_name,
          description
      `,
      [input.categoryName, input.description]
    );

    return mapCategory(result.rows[0]);
  },

  async getCategoryById(categoryId: number) {
    const result = await postgresDb.query<CategoryRow>(
      `
        select
          category_id,
          category_name,
          description
        from public.categories
        where category_id = $1
        limit 1
      `,
      [categoryId]
    );

    const row = result.rows[0];

    return row ? mapCategory(row) : null;
  },

  async updateCategory(categoryId: number, input: CategoryInput) {
    const result = await postgresDb.query<CategoryRow>(
      `
        update public.categories
        set
          category_name = $2,
          description = $3
        where category_id = $1
        returning
          category_id,
          category_name,
          description
      `,
      [categoryId, input.categoryName, input.description]
    );

    const row = result.rows[0];

    return row ? mapCategory(row) : null;
  },

  async deleteCategory(categoryId: number) {
    try {
      const result = await postgresDb.query(
        `
          delete from public.categories
          where category_id = $1
        `,
        [categoryId]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      if (isForeignKeyError(error)) {
        throw storeError.create('CONFLICT', 'store.categoryDeleteConflict', 409);
      }

      throw error;
    }
  },

  // ===================== Product Methods =====================

  async listProducts(filters: ProductListFilters) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.search) {
      values.push(`%${filters.search}%`);
      conditions.push(`p.name ilike $${values.length}`);
    }

    if (filters.categoryId) {
      values.push(filters.categoryId);
      conditions.push(`p.category_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';

    const result = await postgresDb.query<ProductRow>(
      `
        select
          p.product_id,
          p.category_id,
          c.category_name,
          p.name,
          p.price,
          p.stock_quantity,
          p.discount,
          p.description,
          p.image_url,
          p.image_public_id
        from public.products as p
        left join public.categories as c
          on c.category_id = p.category_id
        ${whereClause}
        order by p.name asc
      `,
      values
    );

    return result.rows.map(mapProduct);
  },

  async createProduct(input: ProductInput) {
    try {
      const result = await postgresDb.query<ProductRow>(
        `
          insert into public.products (
            category_id,
            name,
            price,
            stock_quantity,
            discount,
            description
          )
          values ($1, $2, $3, $4, $5, $6)
          returning
            product_id,
            category_id,
            name,
            price,
            stock_quantity,
            discount,
            description,
            image_url,
            image_public_id
        `,
        [input.categoryId, input.name, input.price, input.stockQuantity, input.discount, input.description]
      );

      return mapProduct(result.rows[0]);
    } catch (error) {
      if (isForeignKeyError(error)) {
        throw storeError.create('NOT_FOUND', 'store.categoryNotFound', 404);
      }

      throw error;
    }
  },

  async getProductById(productId: number) {
    const result = await postgresDb.query<ProductRow>(
      `
        select
          product_id,
          category_id,
          name,
          price,
          stock_quantity,
          discount,
          description,
          image_url,
          image_public_id
        from public.products
        where product_id = $1
        limit 1
      `,
      [productId]
    );

    const row = result.rows[0];

    return row ? mapProduct(row) : null;
  },

  async updateProduct(productId: number, input: ProductInput) {
    try {
      const result = await postgresDb.query<ProductRow>(
        `
          update public.products
          set
            category_id = $2,
            name = $3,
            price = $4,
            stock_quantity = $5,
            discount = $6,
            description = $7
          where product_id = $1
          returning
            product_id,
            category_id,
            name,
            price,
            stock_quantity,
            discount,
            description,
            image_url,
            image_public_id
        `,
        [productId, input.categoryId, input.name, input.price, input.stockQuantity, input.discount, input.description]
      );

      const row = result.rows[0];

      return row ? mapProduct(row) : null;
    } catch (error) {
      if (isForeignKeyError(error)) {
        throw storeError.create('NOT_FOUND', 'store.categoryNotFound', 404);
      }

      throw error;
    }
  },

  async getProductImageMeta(productId: number) {
    const result = await postgresDb.query<{ image_url: string | null; image_public_id: string | null }>(
      `
        select
          image_url,
          image_public_id
        from public.products
        where product_id = $1
        limit 1
      `,
      [productId]
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      imageUrl: row.image_url,
      imagePublicId: row.image_public_id,
    };
  },

  async updateProductImage(productId: number, imageUrl: string, imagePublicId: string) {
    const result = await postgresDb.query<ProductRow>(
      `
        update public.products
        set
          image_url = $2,
          image_public_id = $3
        where product_id = $1
        returning
          product_id,
          category_id,
          name,
          price,
          stock_quantity,
          discount,
          description,
          image_url,
          image_public_id
      `,
      [productId, imageUrl, imagePublicId]
    );

    const row = result.rows[0];

    return row ? mapProduct(row) : null;
  },

  async clearProductImage(productId: number) {
    const result = await postgresDb.query<ProductRow>(
      `
        update public.products
        set
          image_url = null,
          image_public_id = null
        where product_id = $1
        returning
          product_id,
          category_id,
          name,
          price,
          stock_quantity,
          discount,
          description,
          image_url,
          image_public_id
      `,
      [productId]
    );

    const row = result.rows[0];

    return row ? mapProduct(row) : null;
  },

  async deleteProduct(productId: number) {
    try {
      const result = await postgresDb.query(
        `
          delete from public.products
          where product_id = $1
        `,
        [productId]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      if (isForeignKeyError(error)) {
        throw storeError.create('CONFLICT', 'store.productDeleteConflict', 409);
      }

      throw error;
    }
  },

  // ===================== Supplier Methods =====================

  async listSuppliers() {
    const result = await postgresDb.query<SupplierRow>(
      `
        select
          supplier_id,
          name,
          phone_number,
          email
        from public.suppliers
        order by name asc
      `
    );

    return result.rows.map(mapSupplier);
  },

  async createSupplier(input: SupplierInput) {
    const result = await postgresDb.query<SupplierRow>(
      `
        insert into public.suppliers (
          name,
          phone_number,
          email
        )
        values ($1, $2, $3)
        returning
          supplier_id,
          name,
          phone_number,
          email
      `,
      [input.name, input.phoneNumber, input.email]
    );

    return mapSupplier(result.rows[0]);
  },

  async getSupplierById(supplierId: number) {
    const result = await postgresDb.query<SupplierRow>(
      `
        select
          supplier_id,
          name,
          phone_number,
          email
        from public.suppliers
        where supplier_id = $1
        limit 1
      `,
      [supplierId]
    );

    const row = result.rows[0];

    return row ? mapSupplier(row) : null;
  },

  async updateSupplier(supplierId: number, input: SupplierInput) {
    const result = await postgresDb.query<SupplierRow>(
      `
        update public.suppliers
        set
          name = $2,
          phone_number = $3,
          email = $4
        where supplier_id = $1
        returning
          supplier_id,
          name,
          phone_number,
          email
      `,
      [supplierId, input.name, input.phoneNumber, input.email]
    );

    const row = result.rows[0];

    return row ? mapSupplier(row) : null;
  },

  async deleteSupplier(supplierId: number) {
    try {
      const result = await postgresDb.query(
        `
          delete from public.suppliers
          where supplier_id = $1
        `,
        [supplierId]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      if (isForeignKeyError(error)) {
        throw storeError.create('CONFLICT', 'store.supplierDeleteConflict', 409);
      }

      throw error;
    }
  },
};
