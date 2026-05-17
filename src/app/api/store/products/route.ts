import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeUserService } from '@/server/domains/store/infrastructure/store-service-factory';
import { storeRoutePresenter, storeRouteRequest } from '@/app/api/store/_shared/store-route-helpers';

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const products = await storeUserService.listProducts({
      search: storeRouteRequest.readOptionalQueryString(searchParams.get('search')),
      categoryId: storeRouteRequest.readQueryId(searchParams.get('categoryId')),
    });

    return NextResponse.json(backendResponse.success({ products }), { status: 200 });
  } catch (error) {
    return storeRoutePresenter.error(error, request);
  }
}
