import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeAdminService } from '@/server/domains/store/infrastructure/store-service-factory';
import { adminRoutePresenter, adminRouteRequest } from '@/app/api/admin/_shared/admin-route-helpers';

// ===================== TYPES =====================
type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { categoryId } = await context.params;
    const category = await storeAdminService.getCategoryById(adminRouteRequest.readPathId(categoryId));

    return NextResponse.json(backendResponse.success({ category }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { categoryId } = await context.params;
    const body = await adminRouteRequest.readJsonBody(request);
    const category = await storeAdminService.updateCategory(adminRouteRequest.readPathId(categoryId), body);

    return NextResponse.json(backendResponse.success({ category }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { categoryId } = await context.params;
    await storeAdminService.deleteCategory(adminRouteRequest.readPathId(categoryId));

    return NextResponse.json(backendResponse.success({ deleted: true }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}
