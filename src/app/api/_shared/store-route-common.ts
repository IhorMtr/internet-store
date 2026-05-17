import type { NextRequest } from 'next/server';
import { storeError } from '@/server/domains/store/domain/store-error';

// ===================== Shared Request Parsers =====================

export async function readJsonObjectBody(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw storeError.create('VALIDATION_ERROR', 'store.requestBodyObjectRequired', 400);
    }

    return body as Record<string, unknown>;
  } catch (error) {
    if (storeError.is(error)) {
      throw error;
    }

    throw storeError.create('VALIDATION_ERROR', 'store.requestBodyInvalid', 400);
  }
}

export function parsePositiveIntegerId(value: string | undefined): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw storeError.create('VALIDATION_ERROR', 'store.validation.invalidId', 400);
  }

  return parsed;
}

export function parseOptionalQueryId(value: string | null): number | null {
  if (!value || value.trim().length === 0) {
    return null;
  }

  return parsePositiveIntegerId(value);
}

export function parseOptionalQueryString(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

export function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();

  return token.length > 0 ? token : null;
}
