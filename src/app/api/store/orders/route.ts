import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeUserService } from '@/server/domains/store/infrastructure/store-service-factory';
import { isStockConflictError } from '@/server/domains/store/application/store-user-service';
import { backendMessages } from '@/server/shared/i18n/backend-messages';
import { storeRoutePresenter, storeRouteRequest } from '@/app/api/store/_shared/store-route-helpers';

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function GET(request: NextRequest) {
  try {
    const session = await storeRouteRequest.requireCustomerSession(request);
    const orders = await storeUserService.listOrders(session.customerId);

    return NextResponse.json(backendResponse.success({ orders }), { status: 200 });
  } catch (error) {
    return storeRoutePresenter.error(error, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await storeRouteRequest.requireCustomerSession(request);
    const body = await storeRouteRequest.readJsonBody(request);
    const order = await storeUserService.createOrder(session.customerId, body);

    return NextResponse.json(backendResponse.success({ order }), { status: 201 });
  } catch (error) {
    if (isStockConflictError(error)) {
      const locale = backendMessages.getLocale(request);

      return NextResponse.json(
        {
          success: false,
          message: backendMessages.translate('store.insufficientStock', locale),
          data: {
            stockConflicts: error.stockConflicts,
          },
        },
        { status: 409 }
      );
    }

    return storeRoutePresenter.error(error, request);
  }
}
