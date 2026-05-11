import { storeError } from '@/server/domains/store/domain/store-error';
import type {
  AdminOrderDetailsRow,
  AdminOrderListItem,
  AdminSummary,
  Category,
  CreateDeliveryInput,
  Delivery,
  DeliveryItem,
  PaymentInput,
  Product,
  ShipmentInput,
  SoldProductReportRow,
  Supplier,
  TopCategoryReportRow,
} from '@/server/domains/store/domain/store-models';
import type {
  CategoryInput,
  DeliveryDetails,
  OrdersListFilters,
  ProductInput,
  ProductListFilters,
  StoreRepository,
  SupplierInput,
} from '@/server/domains/store/application/store-ports';
import { postgresDb, postgresPool } from '@/server/shared/db/postgres-pool';

// ===================== TYPES =====================
type CategoryRow = {
  category_id: number;
  category_name: string;
  description: string | null;
};

type ProductRow = {
  product_id: number;
  category_id: number;
  name: string;
  price: number | string;
  stock_quantity: number;
  discount: number | string;
  description: string | null;
};

type SupplierRow = {
  supplier_id: number;
  name: string;
  phone_number: string | null;
  email: string | null;
};

type DeliveryRow = {
  delivery_id: number;
  supplier_id: number;
  supplier_name: string;
  delivery_date: Date | string;
  invoice_number: string;
};

type DeliveryItemRow = {
  delivery_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  supply_price: number | string;
};

type AdminOrderListRow = {
  order_id: number;
  customer_id: number;
  customer_name: string;
  order_date: Date | string;
  status: string;
  total_amount: number | string;
  payment_method: string | null;
  shipping_status: string | null;
};

type ReportSoldProductsRow = {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_amount: number | string;
};

type ReportTopCategoriesRow = {
  category_id: number;
  category_name: string;
  total_quantity: number;
  total_amount: number | string;
};

type PostgresError = Error & {
  code?: string;
  constraint?: string;
  detail?: string;
};

// ===================== HELPERS =====================
function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value);
}

function toDateString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function mapCategory(row: CategoryRow): Category {
  return {
    categoryId: row.category_id,
    categoryName: row.category_name,
    description: row.description,
  };
}

function mapProduct(row: ProductRow): Product {
  return {
    productId: row.product_id,
    categoryId: row.category_id,
    name: row.name,
    price: toNumber(row.price),
    stockQuantity: row.stock_quantity,
    discount: toNumber(row.discount),
    description: row.description,
  };
}

function mapSupplier(row: SupplierRow): Supplier {
  return {
    supplierId: row.supplier_id,
    name: row.name,
    phoneNumber: row.phone_number,
    email: row.email,
  };
}

function mapDelivery(row: DeliveryRow): Delivery {
  return {
    deliveryId: row.delivery_id,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    deliveryDate: toDateString(row.delivery_date),
    invoiceNumber: row.invoice_number,
  };
}

function mapDeliveryItem(row: DeliveryItemRow): DeliveryItem {
  return {
    deliveryId: row.delivery_id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    supplyPrice: toNumber(row.supply_price),
  };
}

function mapOrderListRow(row: AdminOrderListRow): AdminOrderListItem {
  return {
    orderId: row.order_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    orderDate: toDateString(row.order_date),
    status: row.status,
    totalAmount: toNumber(row.total_amount),
    paymentMethod: row.payment_method,
    shippingStatus: row.shipping_status,
  };
}

function asPostgresError(error: unknown): PostgresError {
  return error as PostgresError;
}

function isForeignKeyError(error: unknown): boolean {
  return asPostgresError(error).code === '23503';
}

function isUniqueViolation(error: unknown): boolean {
  return asPostgresError(error).code === '23505';
}

function isRaisedException(error: unknown): boolean {
  return asPostgresError(error).code === 'P0001';
}

function toAdminOrderDetailsRow(row: Record<string, unknown>): AdminOrderDetailsRow {
  const rawOrderId = row.order_id;

  if (typeof rawOrderId !== 'number') {
    return {
      ...row,
      orderId: 0,
    };
  }

  return {
    ...row,
    orderId: rawOrderId,
  };
}

// ===================== SERVICES =====================
export const postgresStoreRepository: StoreRepository = {
  async listCategories(): Promise<Category[]> {
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

  async createCategory(input: CategoryInput): Promise<Category> {
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

  async getCategoryById(categoryId: number): Promise<Category | null> {
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

  async updateCategory(categoryId: number, input: CategoryInput): Promise<Category | null> {
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

  async deleteCategory(categoryId: number): Promise<boolean> {
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

  async listProducts(filters: ProductListFilters): Promise<Product[]> {
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
          p.name,
          p.price,
          p.stock_quantity,
          p.discount,
          p.description
        from public.products as p
        ${whereClause}
        order by p.name asc
      `,
      values
    );

    return result.rows.map(mapProduct);
  },

  async createProduct(input: ProductInput): Promise<Product> {
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
            description
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

  async getProductById(productId: number): Promise<Product | null> {
    const result = await postgresDb.query<ProductRow>(
      `
        select
          product_id,
          category_id,
          name,
          price,
          stock_quantity,
          discount,
          description
        from public.products
        where product_id = $1
        limit 1
      `,
      [productId]
    );

    const row = result.rows[0];

    return row ? mapProduct(row) : null;
  },

  async updateProduct(productId: number, input: ProductInput): Promise<Product | null> {
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
            description
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

  async deleteProduct(productId: number): Promise<boolean> {
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

  async listSuppliers(): Promise<Supplier[]> {
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

  async createSupplier(input: SupplierInput): Promise<Supplier> {
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

  async getSupplierById(supplierId: number): Promise<Supplier | null> {
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

  async updateSupplier(supplierId: number, input: SupplierInput): Promise<Supplier | null> {
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

  async deleteSupplier(supplierId: number): Promise<boolean> {
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

  async listDeliveries(): Promise<Delivery[]> {
    const result = await postgresDb.query<DeliveryRow>(
      `
        select
          d.delivery_id,
          d.supplier_id,
          s.name as supplier_name,
          d.delivery_date,
          d.invoice_number
        from public.deliveries as d
        inner join public.suppliers as s
          on s.supplier_id = d.supplier_id
        order by d.delivery_date desc, d.delivery_id desc
      `
    );

    return result.rows.map(mapDelivery);
  },

  async createDelivery(input: CreateDeliveryInput): Promise<number> {
    try {
      const result = await postgresDb.query<{ delivery_id: number }>(
        `
          select public.pr_register_delivery($1, $2, $3, $4::jsonb) as delivery_id
        `,
        [
          input.supplierId,
          input.deliveryDate,
          input.invoiceNumber,
          JSON.stringify(
            input.items.map(item => ({
              product_id: item.productId,
              quantity: item.quantity,
              supply_price: item.supplyPrice,
            }))
          ),
        ]
      );

      return result.rows[0].delivery_id;
    } catch (error) {
      if (isRaisedException(error)) {
        throw storeError.create('BAD_REQUEST', 'store.deliveryCreateFailed', 400);
      }

      throw error;
    }
  },

  async getDeliveryById(deliveryId: number): Promise<DeliveryDetails | null> {
    const deliveryResult = await postgresDb.query<DeliveryRow>(
      `
        select
          d.delivery_id,
          d.supplier_id,
          s.name as supplier_name,
          d.delivery_date,
          d.invoice_number
        from public.deliveries as d
        inner join public.suppliers as s
          on s.supplier_id = d.supplier_id
        where d.delivery_id = $1
        limit 1
      `,
      [deliveryId]
    );

    const deliveryRow = deliveryResult.rows[0];

    if (!deliveryRow) {
      return null;
    }

    const itemsResult = await postgresDb.query<DeliveryItemRow>(
      `
        select
          si.delivery_id,
          si.product_id,
          p.name as product_name,
          si.quantity,
          si.supply_price
        from public.supply_item as si
        inner join public.products as p
          on p.product_id = si.product_id
        where si.delivery_id = $1
        order by si.product_id asc
      `,
      [deliveryId]
    );

    return {
      delivery: mapDelivery(deliveryRow),
      items: itemsResult.rows.map(mapDeliveryItem),
    };
  },

  async listOrders(filters: OrdersListFilters): Promise<AdminOrderListItem[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`o.status = $${values.length}`);
    }

    if (filters.customerId) {
      values.push(filters.customerId);
      conditions.push(`o.customer_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';

    const result = await postgresDb.query<AdminOrderListRow>(
      `
        select
          o.order_id,
          o.customer_id,
          c.full_name as customer_name,
          o.order_date,
          o.status,
          o.total_amount,
          p.payment_method,
          sh.shipping_status
        from public.orders as o
        inner join public.customers as c
          on c.customer_id = o.customer_id
        left join lateral (
          select payment_method
          from public.payments
          where order_id = o.order_id
          order by payment_date desc, payment_id desc
          limit 1
        ) as p on true
        left join public.shipment as sh
          on sh.order_id = o.order_id
        ${whereClause}
        order by o.order_date desc, o.order_id desc
      `,
      values
    );

    return result.rows.map(mapOrderListRow);
  },

  async getOrderDetails(orderId: number): Promise<AdminOrderDetailsRow[]> {
    const result = await postgresDb.query<Record<string, unknown>>(
      `
        select *
        from public.v_order_details
        where order_id = $1
      `,
      [orderId]
    );

    return result.rows.map(toAdminOrderDetailsRow);
  },

  async createShipment(orderId: number, input: ShipmentInput): Promise<number> {
    try {
      const result = await postgresDb.query<{ shipment_id: number }>(
        `
          select public.pr_create_shipment($1, $2, $3, $4, $5) as shipment_id
        `,
        [orderId, input.shippingService, input.trackingNumber, input.shippingAddress, input.shippingStatus]
      );

      return result.rows[0].shipment_id;
    } catch (error) {
      const postgresError = asPostgresError(error);

      if (isRaisedException(error)) {
        if (postgresError.message.includes('already exists')) {
          throw storeError.create('CONFLICT', 'store.shipmentAlreadyExists', 409);
        }

        if (postgresError.message.includes('does not exist')) {
          throw storeError.create('NOT_FOUND', 'store.orderNotFound', 404);
        }
      }

      throw error;
    }
  },

  async updateShipment(orderId: number, input: ShipmentInput): Promise<boolean> {
    const result = await postgresDb.query(
      `
        update public.shipment
        set
          shipping_service = $2,
          tracking_number = $3,
          shipping_address = $4,
          shipping_status = $5
        where order_id = $1
      `,
      [orderId, input.shippingService, input.trackingNumber, input.shippingAddress, input.shippingStatus]
    );

    return (result.rowCount ?? 0) > 0;
  },

  async registerPayment(orderId: number, input: PaymentInput): Promise<number> {
    const client = await postgresPool.connect();

    try {
      await client.query('begin');
      const existingPayment = await client.query<{ payment_id: number }>(
        `
          select payment_id
          from public.payments
          where order_id = $1
          limit 1
        `,
        [orderId]
      );

      if (existingPayment.rows[0]) {
        throw storeError.create('CONFLICT', 'store.paymentAlreadyExists', 409);
      }

      await client.query(
        `
          call public.pr_register_payment($1, current_date, $2)
        `,
        [orderId, input.paymentMethod]
      );
      const result = await client.query<{ payment_id: number }>(
        `
          select payment_id
          from public.payments
          where order_id = $1
          order by payment_id desc
          limit 1
        `,
        [orderId]
      );
      const payment = result.rows[0];

      if (!payment) {
        throw storeError.create('BAD_REQUEST', 'store.paymentRegisterFailed', 400);
      }

      await client.query('commit');

      return payment.payment_id;
    } catch (error) {
      await client.query('rollback');

      const postgresError = asPostgresError(error);

      if (storeError.is(error)) {
        throw error;
      }

      if (isRaisedException(error)) {
        if (postgresError.message.toLowerCase().includes('already')) {
          throw storeError.create('CONFLICT', 'store.paymentAlreadyExists', 409);
        }

        if (postgresError.message.toLowerCase().includes('does not exist')) {
          throw storeError.create('NOT_FOUND', 'store.orderNotFound', 404);
        }

        throw storeError.create('BAD_REQUEST', 'store.paymentRegisterFailed', 400);
      }

      if (isUniqueViolation(error)) {
        throw storeError.create('CONFLICT', 'store.paymentAlreadyExists', 409);
      }

      throw error;
    } finally {
      client.release();
    }
  },

  async getSoldProductsByDate(date: string): Promise<SoldProductReportRow[]> {
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

  async getTopCategoriesByPeriod(dateFrom: string, dateTo: string): Promise<TopCategoryReportRow[]> {
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

  async getAdminSummary(lowStockThreshold: number): Promise<AdminSummary> {
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
