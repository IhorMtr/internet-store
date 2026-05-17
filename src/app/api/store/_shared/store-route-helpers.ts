import { NextResponse, type NextRequest } from 'next/server';
import { authService } from '@/server/domains/auth/infrastructure/auth-service-factory';
import type { AuthUser } from '@/server/domains/auth/domain/auth-models';
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

// ===================== TYPES =====================
export type StoreCustomerSession = {
  user: AuthUser;
  customerId: number;
};

// ===================== EXPORTS =====================
export const storeRouteRequest = {
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

  async requireCustomerSession(request: NextRequest): Promise<StoreCustomerSession> {
    const currentSession = await authService.getCurrentAccessSession(getBearerToken(request));

    if (!currentSession) {
      throw storeError.create('UNAUTHORIZED', 'store.unauthorized', 401);
    }

    if (currentSession.user.roleName !== 'user') {
      throw storeError.create('FORBIDDEN', 'store.forbidden', 403);
    }

    const customerId = await authService.getOrCreateCustomerForUser(currentSession.user);

    if (!customerId) {
      throw storeError.create('BAD_REQUEST', 'store.customerRequired', 400);
    }

    return {
      user: currentSession.user,
      customerId,
    };
  },
};

export const storeRoutePresenter = {
  error(error: unknown, request: NextRequest): NextResponse {
    const locale = backendMessages.getLocale(request);

    if (storeError.is(error)) {
      return NextResponse.json(backendResponse.error(backendMessages.translate(error.messageKey, locale)), {
        status: error.status,
      });
    }

    console.error('[api][store] unexpected error', error);

    return NextResponse.json(backendResponse.error(backendMessages.translate('common.internalServerError', locale)), {
      status: 500,
    });
  },
};
