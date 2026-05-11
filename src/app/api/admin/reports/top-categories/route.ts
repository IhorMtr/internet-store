import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeAdminService } from '@/server/domains/store/infrastructure/store-service-factory';
import { adminRoutePresenter, adminRouteRequest } from '@/app/api/admin/_shared/admin-route-helpers';
import { storeError } from '@/server/domains/store/domain/store-error';

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function GET(request: NextRequest) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const dateFrom = request.nextUrl.searchParams.get('dateFrom');
    const dateTo = request.nextUrl.searchParams.get('dateTo');

    if (!dateFrom || !dateTo) {
      throw storeError.create('VALIDATION_ERROR', 'store.validation.requiredField', 400);
    }

    const rows = await storeAdminService.getTopCategoriesByPeriod(dateFrom, dateTo);

    return NextResponse.json(backendResponse.success({ rows }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}
