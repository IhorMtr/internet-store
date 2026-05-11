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
    const orders = await storeAdminService.listOrders({
      status: adminRouteRequest.readOptionalQueryString(searchParams.get('status')),
      customerId: adminRouteRequest.readQueryId(searchParams.get('customerId')),
    });

    return NextResponse.json(backendResponse.success({ orders }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}
