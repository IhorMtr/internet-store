import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeAdminService } from '@/server/domains/store/infrastructure/store-service-factory';
import { adminRoutePresenter, adminRouteRequest } from '@/app/api/admin/_shared/admin-route-helpers';

// ===================== TYPES =====================
type RouteContext = {
  params: Promise<{
    supplierId: string;
  }>;
};

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { supplierId } = await context.params;
    const supplier = await storeAdminService.getSupplierById(adminRouteRequest.readPathId(supplierId));

    return NextResponse.json(backendResponse.success({ supplier }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { supplierId } = await context.params;
    const body = await adminRouteRequest.readJsonBody(request);
    const supplier = await storeAdminService.updateSupplier(adminRouteRequest.readPathId(supplierId), body);

    return NextResponse.json(backendResponse.success({ supplier }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { supplierId } = await context.params;
    await storeAdminService.deleteSupplier(adminRouteRequest.readPathId(supplierId));

    return NextResponse.json(backendResponse.success({ deleted: true }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}
