import { NextResponse, type NextRequest } from 'next/server';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeUserService } from '@/server/domains/store/infrastructure/store-service-factory';
import { storeRoutePresenter } from '@/app/api/store/_shared/store-route-helpers';

// ===================== CONSTANTS =====================
export const runtime = 'nodejs';

// ===================== HANDLERS =====================
export async function GET(request: NextRequest) {
  try {
    const categories = await storeUserService.listCategories();

    return NextResponse.json(backendResponse.success({ categories }), { status: 200 });
  } catch (error) {
    return storeRoutePresenter.error(error, request);
  }
}
