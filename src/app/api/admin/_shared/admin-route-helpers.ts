import { NextResponse, type NextRequest } from 'next/server';
import { authService } from '@/server/domains/auth/infrastructure/auth-service-factory';
import { backendResponse } from '@/server/shared/http/base-response';
import { backendMessages } from '@/server/shared/i18n/backend-messages';
import { storeError } from '@/server/domains/store/domain/store-error';
import {
  getBearerToken,
  parseOptionalQueryId,
  parseOptionalQueryString,
  parsePositiveIntegerId,
  readJsonObjectBody,
} from '@/app/api/_shared/store-route-common';

// ===================== HELPERS =====================
// ===================== EXPORTS =====================
export const adminRouteRequest = {
  async readJsonBody(request: NextRequest): Promise<Record<string, unknown>> {
    return readJsonObjectBody(request);
  },

  readPathId(value: string | undefined): number {
    return parsePositiveIntegerId(value);
  },

  readQueryId(value: string | null): number | null {
    return parseOptionalQueryId(value);
  },

  readOptionalQueryString(value: string | null): string | null {
    return parseOptionalQueryString(value);
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
