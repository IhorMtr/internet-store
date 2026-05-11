import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeAdminService } from '@/server/domains/store/infrastructure/store-service-factory';
import { adminRoutePresenter, adminRouteRequest } from '@/app/api/admin/_shared/admin-route-helpers';

// ===================== TYPES =====================
type RouteContext = {
  params: Promise<{
    deliveryId: string;
  }>;
};

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { deliveryId } = await context.params;
    const details = await storeAdminService.getDeliveryById(adminRouteRequest.readPathId(deliveryId));

    return NextResponse.json(backendResponse.success(details), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}
