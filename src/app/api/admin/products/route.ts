import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeAdminService } from '@/server/domains/store/infrastructure/store-service-factory';
import { adminRoutePresenter, adminRouteRequest } from '@/app/api/admin/_shared/admin-route-helpers';

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function GET(request: NextRequest) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const products = await storeAdminService.listProducts({
      search: adminRouteRequest.readOptionalQueryString(searchParams.get('search')),
      categoryId: adminRouteRequest.readQueryId(searchParams.get('categoryId')),
    });

    return NextResponse.json(backendResponse.success({ products }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const body = await adminRouteRequest.readJsonBody(request);
    const product = await storeAdminService.createProduct(body);

    return NextResponse.json(backendResponse.success({ product }), { status: 201 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}
