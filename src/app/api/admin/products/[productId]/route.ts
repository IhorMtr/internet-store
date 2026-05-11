import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeAdminService } from '@/server/domains/store/infrastructure/store-service-factory';
import { adminRoutePresenter, adminRouteRequest } from '@/app/api/admin/_shared/admin-route-helpers';

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
    await adminRouteRequest.assertAdmin(request);

    const { productId } = await context.params;
    const product = await storeAdminService.getProductById(adminRouteRequest.readPathId(productId));

    return NextResponse.json(backendResponse.success({ product }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { productId } = await context.params;
    const body = await adminRouteRequest.readJsonBody(request);
    const product = await storeAdminService.updateProduct(adminRouteRequest.readPathId(productId), body);

    return NextResponse.json(backendResponse.success({ product }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { productId } = await context.params;
    await storeAdminService.deleteProduct(adminRouteRequest.readPathId(productId));

    return NextResponse.json(backendResponse.success({ deleted: true }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}
