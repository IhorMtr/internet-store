import { NextResponse, type NextRequest } from 'next/server';
import { authService } from '@/server/domains/auth/infrastructure/auth-service-factory';
import { backendResponse } from '@/server/shared/http/base-response';
import { backendMessages } from '@/server/shared/i18n/backend-messages';
import { storeError } from '@/server/domains/store/domain/store-error';

// ===================== HELPERS =====================
function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();

  return token.length > 0 ? token : null;
}

function parsePositiveInteger(value: string | undefined): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw storeError.create('VALIDATION_ERROR', 'store.validation.invalidId', 400);
  }

  return parsed;
}

// ===================== EXPORTS =====================
export const adminRouteRequest = {
  async readJsonBody(request: NextRequest): Promise<Record<string, unknown>> {
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
  },

  readPathId(value: string | undefined): number {
    return parsePositiveInteger(value);
  },

  readQueryId(value: string | null): number | null {
    if (!value || value.trim().length === 0) {
      return null;
    }

    return parsePositiveInteger(value);
  },

  readOptionalQueryString(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : null;
  },

  async assertAdmin(request: NextRequest): Promise<void> {
    const currentSession = await authService.getCurrentAccessSession(getBearerToken(request));

    if (!currentSession) {
      throw storeError.create('UNAUTHORIZED', 'store.unauthorized', 401);
    }

    if (currentSession.user.roleName !== 'admin') {
      throw storeError.create('FORBIDDEN', 'store.forbidden', 403);
    }
  },
};

export const adminRoutePresenter = {
  error(error: unknown, request: NextRequest): NextResponse {
    const locale = backendMessages.getLocale(request);

    if (storeError.is(error)) {
      return NextResponse.json(backendResponse.error(backendMessages.translate(error.messageKey, locale)), {
        status: error.status,
      });
    }

    console.error('[api][admin] unexpected error', error);

    return NextResponse.json(backendResponse.error(backendMessages.translate('common.internalServerError', locale)), {
      status: 500,
    });
  },
};
