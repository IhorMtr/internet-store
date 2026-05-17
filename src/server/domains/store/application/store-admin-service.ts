import { storeError, type StoreError } from '@/server/domains/store/domain/store-error';
import type {
  AdminOrderDetailsRow,
  AdminOrderListItem,
  AdminSummary,
  Category,
  Delivery,
  Product,
  SoldProductReportRow,
  Supplier,
  TopCategoryReportRow,
} from '@/server/domains/store/domain/store-models';
import type {
  CategoryInput,
  OrdersListFilters,
  ProductImageMeta,
  ProductInput,
  ProductListFilters,
  StoreRepository,
  SupplierInput,
} from '@/server/domains/store/application/store-ports';
import {
  storeAdminCategoryInputSchema,
  storeAdminDeliveryInputSchema,
  storeAdminPaymentInputSchema,
  storeAdminProductInputSchema,
  storeAdminReportDateSchema,
  storeAdminShipmentInputSchema,
  storeAdminSupplierInputSchema,
} from '@/server/domains/store/application/validation';
import { validateInput } from '@/server/shared/validation/validate-input';

// ===================== Types =====================

type StoreAdminServiceDependencies = {
  repository: StoreRepository;
};

type BodyInput = Record<string, unknown>;

// ===================== Constants =====================

const LOW_STOCK_THRESHOLD = 5;

// ===================== Schemas =====================

function parseCategoryInput(input: BodyInput): CategoryInput {
  return validateInput(storeAdminCategoryInputSchema, input, () =>
    storeError.create('VALIDATION_ERROR', 'store.validation.requiredField', 400)
  );
}

function parseProductInput(input: BodyInput): ProductInput {
  return validateInput(storeAdminProductInputSchema, input, () =>
    storeError.create('VALIDATION_ERROR', 'store.validation.requiredField', 400)
  );
}

function parseSupplierInput(input: BodyInput): SupplierInput {
  return validateInput(storeAdminSupplierInputSchema, input, () =>
    storeError.create('VALIDATION_ERROR', 'store.validation.requiredField', 400)
  );
}

function parseShipmentInput(input: BodyInput) {
  return validateInput(storeAdminShipmentInputSchema, input, () =>
    storeError.create('VALIDATION_ERROR', 'store.validation.requiredField', 400)
  );
}

function parsePaymentInput(input: BodyInput) {
  return validateInput(storeAdminPaymentInputSchema, input, () =>
    storeError.create('VALIDATION_ERROR', 'store.paymentMethodInvalid', 400)
  );
}

function parseDeliveryInput(input: BodyInput) {
  return validateInput(storeAdminDeliveryInputSchema, input, () =>
    storeError.create('VALIDATION_ERROR', 'store.deliveryCreateFailed', 400)
  );
}

function parseReportDate(date: string): string {
  return validateInput(storeAdminReportDateSchema, date, () =>
    storeError.create('VALIDATION_ERROR', 'store.validation.dateInvalid', 400)
  );
}

// ===================== Patch Helpers =====================

function mergeCategoryPatch(existing: Category, input: BodyInput): CategoryInput {
  return parseCategoryInput({
    categoryName: input.categoryName ?? existing.categoryName,
    description: input.description ?? existing.description,
  });
}

function mergeProductPatch(existing: Product, input: BodyInput): ProductInput {
  return parseProductInput({
    categoryId: input.categoryId ?? existing.categoryId,
    name: input.name ?? existing.name,
    price: input.price ?? existing.price,
    stockQuantity: input.stockQuantity ?? existing.stockQuantity,
    discount: input.discount ?? existing.discount,
    description: input.description ?? existing.description,
  });
}

function mergeSupplierPatch(existing: Supplier, input: BodyInput): SupplierInput {
  return parseSupplierInput({
    name: input.name ?? existing.name,
    phoneNumber: input.phoneNumber ?? existing.phoneNumber,
    email: input.email ?? existing.email,
  });
}

// ===================== Services =====================

export function createStoreAdminService({ repository }: StoreAdminServiceDependencies) {
  // ===================== Category Methods =====================

  async function listCategories(): Promise<Category[]> {
    return repository.listCategories();
  }

  async function createCategory(input: BodyInput): Promise<Category> {
    return repository.createCategory(parseCategoryInput(input));
  }

  async function getCategoryById(categoryId: number): Promise<Category> {
    const category = await repository.getCategoryById(categoryId);

    if (!category) {
      throw storeError.create('NOT_FOUND', 'store.categoryNotFound', 404);
    }

    return category;
  }

  async function updateCategory(categoryId: number, input: BodyInput): Promise<Category> {
    const existing = await repository.getCategoryById(categoryId);

    if (!existing) {
      throw storeError.create('NOT_FOUND', 'store.categoryNotFound', 404);
    }

    const updated = await repository.updateCategory(categoryId, mergeCategoryPatch(existing, input));

    if (!updated) {
      throw storeError.create('NOT_FOUND', 'store.categoryNotFound', 404);
    }

    return updated;
  }

  async function deleteCategory(categoryId: number): Promise<void> {
    const deleted = await repository.deleteCategory(categoryId);

    if (!deleted) {
      throw storeError.create('NOT_FOUND', 'store.categoryNotFound', 404);
    }
  }

  // ===================== Product Methods =====================

  async function listProducts(filters: ProductListFilters): Promise<Product[]> {
    return repository.listProducts(filters);
  }

  async function createProduct(input: BodyInput): Promise<Product> {
    const normalizedInput = parseProductInput(input);
    const category = await repository.getCategoryById(normalizedInput.categoryId);

    if (!category) {
      throw storeError.create('NOT_FOUND', 'store.categoryNotFound', 404);
    }

    return repository.createProduct(normalizedInput);
  }

  async function getProductById(productId: number): Promise<Product> {
    const product = await repository.getProductById(productId);

    if (!product) {
      throw storeError.create('NOT_FOUND', 'store.productNotFound', 404);
    }

    return product;
  }

  async function updateProduct(productId: number, input: BodyInput): Promise<Product> {
    const existing = await repository.getProductById(productId);

    if (!existing) {
      throw storeError.create('NOT_FOUND', 'store.productNotFound', 404);
    }

    const normalizedInput = mergeProductPatch(existing, input);
    const category = await repository.getCategoryById(normalizedInput.categoryId);

    if (!category) {
      throw storeError.create('NOT_FOUND', 'store.categoryNotFound', 404);
    }

    const updated = await repository.updateProduct(productId, normalizedInput);

    if (!updated) {
      throw storeError.create('NOT_FOUND', 'store.productNotFound', 404);
    }

    return updated;
  }

  async function deleteProduct(productId: number): Promise<void> {
    const deleted = await repository.deleteProduct(productId);

    if (!deleted) {
      throw storeError.create('NOT_FOUND', 'store.productNotFound', 404);
    }
  }

  async function getProductImageMeta(productId: number): Promise<ProductImageMeta> {
    const meta = await repository.getProductImageMeta(productId);

    if (!meta) {
      throw storeError.create('NOT_FOUND', 'store.productNotFound', 404);
    }

    return meta;
  }

  async function updateProductImage(productId: number, imageUrl: string, imagePublicId: string): Promise<Product> {
    const updated = await repository.updateProductImage(productId, imageUrl, imagePublicId);

    if (!updated) {
      throw storeError.create('NOT_FOUND', 'store.productNotFound', 404);
    }

    return updated;
  }

  async function clearProductImage(productId: number): Promise<Product> {
    const updated = await repository.clearProductImage(productId);

    if (!updated) {
      throw storeError.create('NOT_FOUND', 'store.productNotFound', 404);
    }

    return updated;
  }

  // ===================== Supplier Methods =====================

  async function listSuppliers(): Promise<Supplier[]> {
    return repository.listSuppliers();
  }

  async function createSupplier(input: BodyInput): Promise<Supplier> {
    return repository.createSupplier(parseSupplierInput(input));
  }

  async function getSupplierById(supplierId: number): Promise<Supplier> {
    const supplier = await repository.getSupplierById(supplierId);

    if (!supplier) {
      throw storeError.create('NOT_FOUND', 'store.supplierNotFound', 404);
    }

    return supplier;
  }

  async function updateSupplier(supplierId: number, input: BodyInput): Promise<Supplier> {
    const existing = await repository.getSupplierById(supplierId);

    if (!existing) {
      throw storeError.create('NOT_FOUND', 'store.supplierNotFound', 404);
    }

    const updated = await repository.updateSupplier(supplierId, mergeSupplierPatch(existing, input));

    if (!updated) {
      throw storeError.create('NOT_FOUND', 'store.supplierNotFound', 404);
    }

    return updated;
  }

  async function deleteSupplier(supplierId: number): Promise<void> {
    const deleted = await repository.deleteSupplier(supplierId);

    if (!deleted) {
      throw storeError.create('NOT_FOUND', 'store.supplierNotFound', 404);
    }
  }

  // ===================== Delivery Methods =====================

  async function listDeliveries(): Promise<Delivery[]> {
    return repository.listDeliveries();
  }

  async function createDelivery(input: BodyInput): Promise<number> {
    return repository.createDelivery(parseDeliveryInput(input));
  }

  async function getDeliveryById(deliveryId: number) {
    const details = await repository.getDeliveryById(deliveryId);

    if (!details) {
      throw storeError.create('NOT_FOUND', 'store.deliveryNotFound', 404);
    }

    return details;
  }

  // ===================== Admin Order Methods =====================

  async function listOrders(filters: OrdersListFilters): Promise<AdminOrderListItem[]> {
    return repository.listOrders(filters);
  }

  async function getOrderDetails(orderId: number): Promise<AdminOrderDetailsRow[]> {
    const details = await repository.getOrderDetails(orderId);

    if (details.length === 0) {
      throw storeError.create('NOT_FOUND', 'store.orderNotFound', 404);
    }

    return details;
  }

  async function createShipment(orderId: number, input: BodyInput): Promise<number> {
    return repository.createShipment(orderId, parseShipmentInput(input));
  }

  async function updateShipment(orderId: number, input: BodyInput): Promise<void> {
    const updated = await repository.updateShipment(orderId, parseShipmentInput(input));

    if (!updated) {
      throw storeError.create('NOT_FOUND', 'store.shipmentNotFound', 404);
    }
  }

  async function registerPayment(orderId: number, input: BodyInput): Promise<number> {
    return repository.registerPayment(orderId, parsePaymentInput(input));
  }

  // ===================== Report Methods =====================

  async function getSoldProductsByDate(date: string): Promise<SoldProductReportRow[]> {
    const normalizedDate = parseReportDate(date);

    return repository.getSoldProductsByDate(normalizedDate);
  }

  async function getTopCategoriesByPeriod(dateFrom: string, dateTo: string): Promise<TopCategoryReportRow[]> {
    const normalizedDateFrom = parseReportDate(dateFrom);
    const normalizedDateTo = parseReportDate(dateTo);

    if (normalizedDateFrom > normalizedDateTo) {
      throw storeError.create('VALIDATION_ERROR', 'store.validation.dateRangeInvalid', 400);
    }

    return repository.getTopCategoriesByPeriod(normalizedDateFrom, normalizedDateTo);
  }

  async function getAdminSummary(): Promise<AdminSummary> {
    return repository.getAdminSummary(LOW_STOCK_THRESHOLD);
  }

  return {
    createCategory,
    createDelivery,
    createProduct,
    createShipment,
    createSupplier,
    deleteCategory,
    deleteProduct,
    deleteSupplier,
    clearProductImage,
    getAdminSummary,
    getCategoryById,
    getDeliveryById,
    getOrderDetails,
    getProductImageMeta,
    getProductById,
    getSoldProductsByDate,
    getSupplierById,
    getTopCategoriesByPeriod,
    listCategories,
    listDeliveries,
    listOrders,
    listProducts,
    listSuppliers,
    registerPayment,
    updateCategory,
    updateProductImage,
    updateProduct,
    updateShipment,
    updateSupplier,
  };
}

// ===================== Exports =====================

export type StoreAdminService = ReturnType<typeof createStoreAdminService>;
export type { StoreError };
