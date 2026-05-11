import { storeError, type StoreError } from '@/server/domains/store/domain/store-error';
import type {
  AdminOrderDetailsRow,
  AdminOrderListItem,
  AdminSummary,
  Category,
  CreateDeliveryInput,
  Delivery,
  PaymentInput,
  Product,
  ShipmentInput,
  SoldProductReportRow,
  Supplier,
  TopCategoryReportRow,
} from '@/server/domains/store/domain/store-models';
import type {
  CategoryInput,
  OrdersListFilters,
  ProductInput,
  ProductListFilters,
  StoreRepository,
  SupplierInput,
} from '@/server/domains/store/application/store-ports';

// ===================== TYPES =====================
type StoreAdminServiceDependencies = {
  repository: StoreRepository;
};

type BodyInput = Record<string, unknown>;

// ===================== CONSTANTS =====================
const LOW_STOCK_THRESHOLD = 5;

// ===================== HELPERS =====================
function readInteger(value: unknown, messageKey: 'store.validation.invalidId'): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw storeError.create('VALIDATION_ERROR', messageKey, 400);
  }

  return value;
}

function readRequiredString(value: unknown, messageKey: 'store.validation.requiredField'): string {
  if (typeof value !== 'string') {
    throw storeError.create('VALIDATION_ERROR', messageKey, 400);
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    throw storeError.create('VALIDATION_ERROR', 'store.validation.nonEmptyString', 400);
  }

  return normalized;
}

function readOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw storeError.create('VALIDATION_ERROR', 'store.validation.nonEmptyString', 400);
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function readNonNegativeNumber(value: unknown, messageKey: 'store.validation.stockNonNegative'): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isInteger(value) || value < 0) {
    throw storeError.create('VALIDATION_ERROR', messageKey, 400);
  }

  return value;
}

function readPositiveInteger(value: unknown, messageKey: 'store.validation.quantityPositive'): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isInteger(value) || value <= 0) {
    throw storeError.create('VALIDATION_ERROR', messageKey, 400);
  }

  return value;
}

function readPositiveNumber(
  value: unknown,
  messageKey: 'store.validation.pricePositive' | 'store.validation.supplyPricePositive'
): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw storeError.create('VALIDATION_ERROR', messageKey, 400);
  }

  return value;
}

function readDiscount(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0 || value > 100) {
    throw storeError.create('VALIDATION_ERROR', 'store.validation.discountRange', 400);
  }

  return value;
}

function readDate(value: unknown): string {
  if (typeof value !== 'string') {
    throw storeError.create('VALIDATION_ERROR', 'store.validation.dateInvalid', 400);
  }

  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw storeError.create('VALIDATION_ERROR', 'store.validation.dateInvalid', 400);
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw storeError.create('VALIDATION_ERROR', 'store.validation.dateInvalid', 400);
  }

  return normalized;
}

function normalizeCategoryInput(input: BodyInput): CategoryInput {
  return {
    categoryName: readRequiredString(input.categoryName, 'store.validation.requiredField'),
    description: readOptionalString(input.description),
  };
}

function normalizeProductInput(input: BodyInput): ProductInput {
  return {
    categoryId: readInteger(input.categoryId, 'store.validation.invalidId'),
    name: readRequiredString(input.name, 'store.validation.requiredField'),
    price: readPositiveNumber(input.price, 'store.validation.pricePositive'),
    stockQuantity: readNonNegativeNumber(input.stockQuantity, 'store.validation.stockNonNegative'),
    discount: readDiscount(input.discount),
    description: readOptionalString(input.description),
  };
}

function normalizeSupplierInput(input: BodyInput): SupplierInput {
  return {
    name: readRequiredString(input.name, 'store.validation.requiredField'),
    phoneNumber: readOptionalString(input.phoneNumber),
    email: readOptionalString(input.email),
  };
}

function normalizeShipmentInput(input: BodyInput): ShipmentInput {
  return {
    shippingService: readRequiredString(input.shippingService, 'store.validation.requiredField'),
    trackingNumber: readRequiredString(input.trackingNumber, 'store.validation.requiredField'),
    shippingAddress: readRequiredString(input.shippingAddress, 'store.validation.requiredField'),
    shippingStatus: readRequiredString(input.shippingStatus, 'store.validation.requiredField'),
  };
}

function normalizePaymentInput(input: BodyInput): PaymentInput {
  return {
    paymentMethod: readRequiredString(input.paymentMethod, 'store.validation.requiredField'),
  };
}

function normalizeDeliveryInput(input: BodyInput): CreateDeliveryInput {
  const supplierId = readInteger(input.supplierId, 'store.validation.invalidId');
  const deliveryDate = readDate(input.deliveryDate);
  const invoiceNumber = readRequiredString(input.invoiceNumber, 'store.validation.requiredField');

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw storeError.create('VALIDATION_ERROR', 'store.validation.deliveryItemsRequired', 400);
  }

  const items = input.items.map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw storeError.create('VALIDATION_ERROR', 'store.validation.deliveryItemInvalid', 400);
    }

    const deliveryItem = item as Record<string, unknown>;

    return {
      productId: readInteger(deliveryItem.productId, 'store.validation.invalidId'),
      quantity: readPositiveInteger(deliveryItem.quantity, 'store.validation.quantityPositive'),
      supplyPrice: readPositiveNumber(deliveryItem.supplyPrice, 'store.validation.supplyPricePositive'),
    };
  });

  return {
    supplierId,
    deliveryDate,
    invoiceNumber,
    items,
  };
}

function mergeCategoryPatch(existing: Category, input: BodyInput): CategoryInput {
  return normalizeCategoryInput({
    categoryName: input.categoryName ?? existing.categoryName,
    description: input.description ?? existing.description,
  });
}

function mergeProductPatch(existing: Product, input: BodyInput): ProductInput {
  return normalizeProductInput({
    categoryId: input.categoryId ?? existing.categoryId,
    name: input.name ?? existing.name,
    price: input.price ?? existing.price,
    stockQuantity: input.stockQuantity ?? existing.stockQuantity,
    discount: input.discount ?? existing.discount,
    description: input.description ?? existing.description,
  });
}

function mergeSupplierPatch(existing: Supplier, input: BodyInput): SupplierInput {
  return normalizeSupplierInput({
    name: input.name ?? existing.name,
    phoneNumber: input.phoneNumber ?? existing.phoneNumber,
    email: input.email ?? existing.email,
  });
}

// ===================== SERVICES =====================
export function createStoreAdminService({ repository }: StoreAdminServiceDependencies) {
  async function listCategories(): Promise<Category[]> {
    return repository.listCategories();
  }

  async function createCategory(input: BodyInput): Promise<Category> {
    return repository.createCategory(normalizeCategoryInput(input));
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

  async function listProducts(filters: ProductListFilters): Promise<Product[]> {
    return repository.listProducts(filters);
  }

  async function createProduct(input: BodyInput): Promise<Product> {
    const normalizedInput = normalizeProductInput(input);
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

  async function listSuppliers(): Promise<Supplier[]> {
    return repository.listSuppliers();
  }

  async function createSupplier(input: BodyInput): Promise<Supplier> {
    return repository.createSupplier(normalizeSupplierInput(input));
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

  async function listDeliveries(): Promise<Delivery[]> {
    return repository.listDeliveries();
  }

  async function createDelivery(input: BodyInput): Promise<number> {
    return repository.createDelivery(normalizeDeliveryInput(input));
  }

  async function getDeliveryById(deliveryId: number) {
    const details = await repository.getDeliveryById(deliveryId);

    if (!details) {
      throw storeError.create('NOT_FOUND', 'store.deliveryNotFound', 404);
    }

    return details;
  }

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
    return repository.createShipment(orderId, normalizeShipmentInput(input));
  }

  async function updateShipment(orderId: number, input: BodyInput): Promise<void> {
    const updated = await repository.updateShipment(orderId, normalizeShipmentInput(input));

    if (!updated) {
      throw storeError.create('NOT_FOUND', 'store.shipmentNotFound', 404);
    }
  }

  async function registerPayment(orderId: number, input: BodyInput): Promise<number> {
    return repository.registerPayment(orderId, normalizePaymentInput(input));
  }

  async function getSoldProductsByDate(date: string): Promise<SoldProductReportRow[]> {
    readDate(date);

    return repository.getSoldProductsByDate(date);
  }

  async function getTopCategoriesByPeriod(dateFrom: string, dateTo: string): Promise<TopCategoryReportRow[]> {
    const normalizedDateFrom = readDate(dateFrom);
    const normalizedDateTo = readDate(dateTo);

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
    getAdminSummary,
    getCategoryById,
    getDeliveryById,
    getOrderDetails,
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
    updateProduct,
    updateShipment,
    updateSupplier,
  };
}

// ===================== EXPORTS =====================
export type StoreAdminService = ReturnType<typeof createStoreAdminService>;
export type { StoreError };
