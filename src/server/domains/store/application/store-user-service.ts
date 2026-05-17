import { storeError, type StoreError } from '@/server/domains/store/domain/store-error';
import type {
  Category,
  Product,
  UserOrderDetails,
  UserOrderListItem,
  UserOrderStockConflict,
  UserPayment,
} from '@/server/domains/store/domain/store-models';
import type {
  CreateUserOrderInput,
  ProductListFilters,
  StoreRepository,
} from '@/server/domains/store/application/store-ports';
import {
  storeUserCreateOrderInputSchema,
  storeUserPaymentInputSchema,
} from '@/server/domains/store/application/validation';
import { validateInput } from '@/server/shared/validation/validate-input';

// ===================== Types =====================

type StoreUserServiceDependencies = {
  repository: StoreRepository;
};

type BodyInput = Record<string, unknown>;

type StoreStockConflictError = StoreError & {
  stockConflicts: UserOrderStockConflict[];
};

// ===================== Schemas =====================

function parseCreateOrderInput(input: BodyInput): CreateUserOrderInput {
  const normalized = validateInput(storeUserCreateOrderInputSchema, input, () =>
    storeError.create('VALIDATION_ERROR', 'store.orderCreateFailed', 400)
  );

  return {
    ...normalized,
    shipment: normalized.shipment
      ? {
          ...normalized.shipment,
          shippingStatus: normalized.shipment.shippingStatus ?? 'processing',
        }
      : null,
  };
}

function parsePaymentInput(input: BodyInput) {
  return validateInput(storeUserPaymentInputSchema, input, () =>
    storeError.create('VALIDATION_ERROR', 'store.paymentMethodInvalid', 400)
  );
}

// ===================== Helpers =====================

function createStockConflictError(conflicts: UserOrderStockConflict[]): StoreStockConflictError {
  return Object.assign(storeError.create('CONFLICT', 'store.insufficientStock', 409), {
    stockConflicts: conflicts,
  });
}

function isStockConflictError(error: unknown): error is StoreStockConflictError {
  return storeError.is(error) && Array.isArray((error as { stockConflicts?: unknown }).stockConflicts);
}

// ===================== Services =====================

export function createStoreUserService({ repository }: StoreUserServiceDependencies) {
  // ===================== User Catalog Methods =====================

  async function listCategories(): Promise<Category[]> {
    return repository.listCatalogCategories();
  }

  async function listProducts(filters: ProductListFilters): Promise<Product[]> {
    return repository.listAvailableProducts(filters);
  }

  async function getProductById(productId: number): Promise<Product> {
    const product = await repository.getAvailableProductById(productId);

    if (!product) {
      throw storeError.create('NOT_FOUND', 'store.productNotFound', 404);
    }

    return product;
  }

  // ===================== User Order Methods =====================

  async function collectStockConflicts(input: CreateUserOrderInput): Promise<UserOrderStockConflict[]> {
    const productsById = new Map(
      (
        await Promise.all(
          input.items.map(async item => {
            const product = await repository.getAvailableProductById(item.productId);

            return [item.productId, product] as const;
          })
        )
      ).map(([productId, product]) => [productId, product])
    );

    const conflicts: UserOrderStockConflict[] = [];

    for (const item of input.items) {
      const product = productsById.get(item.productId);

      if (!product) {
        conflicts.push({
          productId: item.productId,
          productName: `Product #${item.productId}`,
          requestedQuantity: item.quantity,
          availableQuantity: 0,
        });
        continue;
      }

      if (product.stockQuantity <= 0 || item.quantity > product.stockQuantity) {
        conflicts.push({
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity: Math.max(0, product.stockQuantity),
        });
      }
    }

    return conflicts;
  }

  async function createOrder(customerId: number, input: BodyInput): Promise<UserOrderDetails> {
    const normalizedInput = parseCreateOrderInput(input);
    const initialStockConflicts = await collectStockConflicts(normalizedInput);

    if (initialStockConflicts.length > 0) {
      throw createStockConflictError(initialStockConflicts);
    }

    let orderId: number;

    try {
      orderId = await repository.createUserOrder(customerId, normalizedInput);
    } catch (error) {
      if (storeError.is(error) && error.messageKey === 'store.insufficientStock') {
        const raceConditionConflicts = await collectStockConflicts(normalizedInput);

        if (raceConditionConflicts.length > 0) {
          throw createStockConflictError(raceConditionConflicts);
        }
      }

      throw error;
    }

    const order = await repository.getCustomerOrderDetails(customerId, orderId);

    if (!order) {
      throw storeError.create('BAD_REQUEST', 'store.orderCreateFailed', 400);
    }

    return order;
  }

  async function listOrders(customerId: number): Promise<UserOrderListItem[]> {
    return repository.listCustomerOrders(customerId);
  }

  async function getOrderDetails(customerId: number, orderId: number): Promise<UserOrderDetails> {
    const order = await repository.getCustomerOrderDetails(customerId, orderId);

    if (!order) {
      throw storeError.create('NOT_FOUND', 'store.orderNotFound', 404);
    }

    return order;
  }

  // ===================== Payment Methods =====================

  async function registerPayment(customerId: number, orderId: number, input: BodyInput): Promise<UserPayment> {
    return repository.registerCustomerPayment(customerId, orderId, parsePaymentInput(input));
  }

  // ===================== Cancel Order Flow =====================

  async function cancelOrder(customerId: number, orderId: number): Promise<UserOrderDetails> {
    await repository.cancelCustomerOrder(customerId, orderId);

    const order = await repository.getCustomerOrderDetails(customerId, orderId);

    if (!order) {
      throw storeError.create('NOT_FOUND', 'store.orderNotFound', 404);
    }

    return order;
  }

  return {
    createOrder,
    getOrderDetails,
    getProductById,
    listCategories,
    listOrders,
    listProducts,
    cancelOrder,
    registerPayment,
  };
}

// ===================== Exports =====================

export type StoreUserService = ReturnType<typeof createStoreUserService>;
export type { StoreError };
export { isStockConflictError };
