import { NextResponse, type NextRequest } from 'next/server';
import { adminRoutePresenter, adminRouteRequest } from '@/app/api/admin/_shared/admin-route-helpers';
import { backendResponse } from '@/server/shared/http/base-response';
import { storeError } from '@/server/domains/store/domain/store-error';
import { storeAdminService } from '@/server/domains/store/infrastructure/store-service-factory';
import { deleteProductImage, uploadProductImage } from '@/server/shared/cloudinary/cloudinary-client';

// ===================== Types =====================

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

// ===================== Constants =====================

export const runtime = 'nodejs';

// ===================== Helpers =====================

function ensureMultipartContentType(request: NextRequest): void {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    throw storeError.create('VALIDATION_ERROR', 'store.productImageMultipartExpected', 400);
  }
}

async function readMultipartFormData(request: NextRequest): Promise<FormData> {
  try {
    return await request.formData();
  } catch {
    throw storeError.create('VALIDATION_ERROR', 'store.productImageMultipartExpected', 400);
  }
}

function readImageFile(formData: FormData): File {
  const fileValue = formData.get('file');

  if (!fileValue) {
    throw storeError.create('VALIDATION_ERROR', 'store.productImageFileMissing', 400);
  }

  if (!(fileValue instanceof File)) {
    throw storeError.create('VALIDATION_ERROR', 'store.productImageFileMissing', 400);
  }

  return fileValue;
}

// ===================== Handlers =====================

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { productId: rawProductId } = await context.params;
    const productId = adminRouteRequest.readPathId(rawProductId);
    ensureMultipartContentType(request);
    const formData = await readMultipartFormData(request);
    const file = readImageFile(formData);

    const currentProduct = await storeAdminService.getProductById(productId);
    const uploadedImage = await uploadProductImage(file, productId);

    let product;

    try {
      product = await storeAdminService.updateProductImage(
        productId,
        uploadedImage.imageUrl,
        uploadedImage.imagePublicId
      );
    } catch (error) {
      await deleteProductImage(uploadedImage.imagePublicId).catch(() => {
        // Best-effort rollback to avoid orphaned image when DB update fails.
      });

      throw error;
    }

    if (currentProduct.imagePublicId && currentProduct.imagePublicId !== uploadedImage.imagePublicId) {
      await deleteProductImage(currentProduct.imagePublicId);
    }

    return NextResponse.json(backendResponse.success({ product }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await adminRouteRequest.assertAdmin(request);

    const { productId: rawProductId } = await context.params;
    const productId = adminRouteRequest.readPathId(rawProductId);
    const currentProduct = await storeAdminService.getProductById(productId);

    if (currentProduct.imagePublicId) {
      await deleteProductImage(currentProduct.imagePublicId);
    }

    const product = await storeAdminService.clearProductImage(productId);

    return NextResponse.json(backendResponse.success({ product }), { status: 200 });
  } catch (error) {
    return adminRoutePresenter.error(error, request);
  }
}
