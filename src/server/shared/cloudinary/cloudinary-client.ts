import { v2 as cloudinary } from 'cloudinary';
import { storeError } from '@/server/domains/store/domain/store-error';
import { serverEnv } from '@/server/shared/config/env';

// ===================== Types =====================

type UploadedProductImage = {
  imageUrl: string;
  imagePublicId: string;
};

// ===================== Constants =====================

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// ===================== Helpers =====================

function ensureCloudinaryConfigured(): void {
  if (!serverEnv.cloudinaryIsConfigured) {
    throw storeError.create('DATABASE_ERROR', 'store.productImageConfigMissing', 500);
  }
}

function sanitizeFileNamePart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function configureCloudinary(): void {
  ensureCloudinaryConfigured();

  cloudinary.config({
    cloud_name: serverEnv.cloudinaryCloudName!,
    api_key: serverEnv.cloudinaryApiKey!,
    api_secret: serverEnv.cloudinaryApiSecret!,
  });
}

export function validateProductImageFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw storeError.create('VALIDATION_ERROR', 'store.productImageUnsupportedFormat', 400);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw storeError.create('VALIDATION_ERROR', 'store.productImageTooLarge', 400);
  }
}

export async function uploadProductImage(file: File, productId: number): Promise<UploadedProductImage> {
  configureCloudinary();
  validateProductImageFile(file);

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileNamePart = sanitizeFileNamePart(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const publicId = `${serverEnv.cloudinaryFolder}/product-${productId}-${Date.now()}-${fileNamePart}`;

  const uploadResult = await new Promise<{ secure_url?: string; public_id?: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result ?? {});
      }
    );

    stream.end(fileBuffer);
  }).catch(error => {
    console.error('[cloudinary] product image upload failed', error);
    throw storeError.create('DATABASE_ERROR', 'store.productImageUploadFailed', 500);
  });

  if (!uploadResult.secure_url || !uploadResult.public_id) {
    throw storeError.create('DATABASE_ERROR', 'store.productImageUploadFailed', 500);
  }

  return {
    imageUrl: uploadResult.secure_url,
    imagePublicId: uploadResult.public_id,
  };
}

export async function deleteProductImage(imagePublicId: string): Promise<void> {
  if (!imagePublicId || imagePublicId.trim().length === 0) {
    return;
  }

  configureCloudinary();

  const result = await cloudinary.uploader
    .destroy(imagePublicId, { invalidate: true, resource_type: 'image' })
    .catch(error => {
      console.error('[cloudinary] product image delete failed', error);
      throw storeError.create('DATABASE_ERROR', 'store.productImageDeleteFailed', 500);
    });

  if (result.result !== 'ok' && result.result !== 'not found') {
    throw storeError.create('DATABASE_ERROR', 'store.productImageDeleteFailed', 500);
  }
}
