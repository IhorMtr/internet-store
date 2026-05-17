import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeUserService } from '@/server/domains/store/infrastructure/store-service-factory';
import { storeRoutePresenter, storeRouteRequest } from '@/app/api/store/_shared/store-route-helpers';

// ===================== TYPES =====================
type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await storeRouteRequest.requireCustomerSession(request);
    const { orderId } = await context.params;
    const contentLength = Number(request.headers.get('content-length') ?? '0');
    const body = contentLength > 0 ? await storeRouteRequest.readJsonBody(request) : {};

    const payment = await storeUserService.registerPayment(
      session.customerId,
      storeRouteRequest.readPathId(orderId),
      body
    );

    return NextResponse.json(backendResponse.success({ payment }), { status: 201 });
  } catch (error) {
    return storeRoutePresenter.error(error, request);
  }
}
