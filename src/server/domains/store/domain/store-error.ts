import type { BackendMessageKey } from '@/server/shared/i18n/backend-messages';

// ===================== TYPES =====================
export type StoreErrorCode =
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR';

export type StoreError = Error & {
  code: StoreErrorCode;
  messageKey: BackendMessageKey;
  status: number;
};

// ===================== HELPERS =====================
export const storeError = {
  create(code: StoreErrorCode, messageKey: BackendMessageKey, status: number): StoreError {
    return Object.assign(new Error(messageKey), {
      code,
      messageKey,
      name: 'StoreError',
      status,
    });
  },

  is(error: unknown): error is StoreError {
    return error instanceof Error && 'code' in error && 'messageKey' in error && 'status' in error;
  },
};
