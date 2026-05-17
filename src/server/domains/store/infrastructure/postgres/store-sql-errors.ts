import { storeError } from '@/server/domains/store/domain/store-error';
import type { PostgresError } from '@/server/domains/store/infrastructure/postgres/store-row-types';

// ===================== PostgreSQL Error Helpers =====================

export function asPostgresError(error: unknown): PostgresError {
  return error as PostgresError;
}

export function isForeignKeyError(error: unknown): boolean {
  return asPostgresError(error).code === '23503';
}

export function isUniqueViolation(error: unknown): boolean {
  return asPostgresError(error).code === '23505';
}

export function isRaisedException(error: unknown): boolean {
  return asPostgresError(error).code === 'P0001';
}

// ===================== Status Helpers =====================

export function toStatusKey(status: string): string {
  return status
    .trim()
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

export function isCancelledStatus(status: string): boolean {
  const key = toStatusKey(status);

  return key === 'CANCELLED' || key === 'CANCELED';
}

export function isPaidStatus(status: string): boolean {
  return toStatusKey(status) === 'PAID';
}

// ===================== Store Error Mapping =====================

export function createOrderStoreError(error: unknown): never {
  const message = asPostgresError(error).message.toLowerCase();

  if (message.includes('customer') && message.includes('does not exist')) {
    throw storeError.create('BAD_REQUEST', 'store.customerRequired', 400);
  }

  if (message.includes('product') && message.includes('does not exist')) {
    throw storeError.create('NOT_FOUND', 'store.productNotFound', 404);
  }

  if (message.includes('not enough stock')) {
    throw storeError.create('CONFLICT', 'store.insufficientStock', 409);
  }

  if (message.includes('at least one item')) {
    throw storeError.create('VALIDATION_ERROR', 'store.orderItemsRequired', 400);
  }

  if (message.includes('quantity')) {
    throw storeError.create('VALIDATION_ERROR', 'store.validation.quantityPositive', 400);
  }

  throw storeError.create('BAD_REQUEST', 'store.orderCreateFailed', 400);
}
