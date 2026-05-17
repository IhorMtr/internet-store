import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeUserService } from '@/server/domains/store/infrastructure/store-service-factory';
import { storeRoutePresenter, storeRouteRequest } from '@/app/api/store/_shared/store-route-helpers';

// ===================== TYPES =====================
type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { productId } = await context.params;
    const product = await storeUserService.getProductById(storeRouteRequest.readPathId(productId));

    return NextResponse.json(backendResponse.success({ product }), { status: 200 });
  } catch (error) {
    return storeRoutePresenter.error(error, request);
  }
}
