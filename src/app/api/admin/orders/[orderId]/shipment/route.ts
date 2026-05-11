import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeAdminService } from '@/server/domains/store/infrastructure/store-service-factory';
import { adminRoutePresenter, adminRouteRequest } from '@/app/api/admin/_shared/admin-route-helpers';

// ===================== TYPES =====================
type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { orderId } = await context.params;
    const body = await adminRouteRequest.readJsonBody(request);
    const shipmentId = await storeAdminService.createShipment(adminRouteRequest.readPathId(orderId), body);

    return NextResponse.json(backendResponse.success({ shipmentId }), { status: 201 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { orderId } = await context.params;
    const body = await adminRouteRequest.readJsonBody(request);
    await storeAdminService.updateShipment(adminRouteRequest.readPathId(orderId), body);

    return NextResponse.json(backendResponse.success({ updated: true }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}
