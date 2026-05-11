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

    const categories = await storeAdminService.listCategories();

    return NextResponse.json(backendResponse.success({ categories }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const body = await adminRouteRequest.readJsonBody(request);
    const category = await storeAdminService.createCategory(body);

    return NextResponse.json(backendResponse.success({ category }), { status: 201 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}
