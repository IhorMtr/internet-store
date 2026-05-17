import type { AppError } from '@/shared/api/errors';
import type { StoreCartItem, StoreProduct } from '@/domains/store/model/types';

// ========== Types ==========

export type CartStockConflictReason = 'missing' | 'outOfStock' | 'notEnoughStock';

export type CartStockConflict = {
  productId: number;
  productName: string;
  requestedQuantity: number;
  availableQuantity: number;
  reason: CartStockConflictReason;
};

type StoreStockConflictPayload = {
  productId: number;
  productName: string;
  requestedQuantity: number;
  availableQuantity: number;
};

// ========== Helpers ==========

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizePositiveNumber(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return null;
  }

  return value;
}

function normalizeConflictPayload(value: unknown): StoreStockConflictPayload | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const productId = normalizePositiveNumber(value.productId);
  const requestedQuantity = normalizePositiveNumber(value.requestedQuantity);
  const availableQuantity = normalizePositiveNumber(value.availableQuantity);
  const productName =
    typeof value.productName === 'string' && value.productName.trim().length > 0 ? value.productName : null;

  if (!productId || !requestedQuantity || availableQuantity === null || !productName) {
    return null;
  }

  return {
    productId,
    productName,
    requestedQuantity,
    availableQuantity,
  };
}

function toReason(requestedQuantity: number, availableQuantity: number): CartStockConflictReason {
  if (availableQuantity <= 0) {
    return 'outOfStock';
  }

  if (requestedQuantity > availableQuantity) {
    return 'notEnoughStock';
  }

  return 'missing';
}

// ========== Exports ==========

export function getCartStockConflicts(
  cartItems: StoreCartItem[],
  actualProductsById: Map<number, StoreProduct | null>
): CartStockConflict[] {
  const conflicts: CartStockConflict[] = [];

  for (const cartItem of cartItems) {
    const actualProduct = actualProductsById.get(cartItem.productId);

    if (actualProduct === null || actualProduct === undefined) {
      conflicts.push({
        productId: cartItem.productId,
        productName: cartItem.name,
        requestedQuantity: cartItem.quantity,
        availableQuantity: 0,
        reason: 'missing',
      });
      continue;
    }

    if (actualProduct.stockQuantity <= 0) {
      conflicts.push({
        productId: cartItem.productId,
        productName: actualProduct.name,
        requestedQuantity: cartItem.quantity,
        availableQuantity: 0,
        reason: 'outOfStock',
      });
      continue;
    }

    if (cartItem.quantity > actualProduct.stockQuantity) {
      conflicts.push({
        productId: cartItem.productId,
        productName: actualProduct.name,
        requestedQuantity: cartItem.quantity,
        availableQuantity: actualProduct.stockQuantity,
        reason: 'notEnoughStock',
      });
    }
  }

  return conflicts;
}

export function hasCartStockConflicts(conflicts: CartStockConflict[]): boolean {
  return conflicts.length > 0;
}

export function getStockConflictsMapByProductId(conflicts: CartStockConflict[]): Map<number, CartStockConflict> {
  return new Map(conflicts.map(conflict => [conflict.productId, conflict]));
}

export function readCartStockConflictsFromError(error: AppError, cartItems: StoreCartItem[]): CartStockConflict[] {
  if (!isObjectRecord(error.data)) {
    return [];
  }

  const payload = Array.isArray(error.data.stockConflicts) ? error.data.stockConflicts : null;

  if (!payload) {
    return [];
  }

  const fallbackNamesById = new Map(cartItems.map(item => [item.productId, item.name]));

  return payload
    .map(normalizeConflictPayload)
    .filter((conflict): conflict is StoreStockConflictPayload => Boolean(conflict))
    .map(conflict => ({
      productId: conflict.productId,
      productName: fallbackNamesById.get(conflict.productId) ?? conflict.productName,
      requestedQuantity: conflict.requestedQuantity,
      availableQuantity: conflict.availableQuantity,
      reason: toReason(conflict.requestedQuantity, conflict.availableQuantity),
    }));
}
