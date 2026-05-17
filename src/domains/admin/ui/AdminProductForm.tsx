'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { createAdminProductSchema } from '@/domains/admin/model/validation';
import { Button } from '@/shared/ui/button';
import { FileDropzone } from '@/shared/ui/file-dropzone';
import { FormField } from '@/shared/ui/form-field';
import type { SelectOption } from '@/shared/ui/select';
import { Select } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { ProductImage } from '@/shared/ui/product-image/ProductImage';
import { Textarea } from '@/shared/ui/textarea';

// ========== Types ==========

type ProductFormValues = {
  categoryId: string;
  name: string;
  price: string;
  stockQuantity: string;
  discount: string;
  description: string;
};

type AdminProductFormProps = {
  categoryOptions: SelectOption[];
  currentImageUrl: string | null;
  imageErrorMessage: string | null;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  isImageRemoving: boolean;
  initialValues: ProductFormValues;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onImageSelected: (file: File | null) => void;
  onRemoveImage: () => Promise<void>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
};

// ========== Form Helpers ==========

function isFieldInvalid(error: unknown, isTouched: unknown, submitCount: number) {
  return Boolean((isTouched || submitCount > 0) && error);
}

// ========== Component ==========

export function AdminProductForm({
  categoryOptions,
  currentImageUrl,
  imageErrorMessage,
  imageFile,
  imagePreviewUrl,
  isImageRemoving,
  initialValues,
  isSubmitting,
  mode,
  onCancel,
  onImageSelected,
  onRemoveImage,
  onSubmit,
}: AdminProductFormProps) {
  // ========== Translations ==========

  const t = useTranslations('AdminProducts');

  // ========== Validation ==========

  const validationSchema = createAdminProductSchema({
    categoryRequired: t('validation.categoryRequired'),
    nameRequired: t('validation.nameRequired'),
    priceRequired: t('validation.priceRequired'),
    priceInvalid: t('validation.priceInvalid'),
    stockRequired: t('validation.stockRequired'),
    stockInvalid: t('validation.stockInvalid'),
    discountRequired: t('validation.discountRequired'),
    discountInvalid: t('validation.discountInvalid'),
    discountRange: t('validation.discountRange'),
    descriptionTooLong: t('validation.descriptionTooLong'),
  });

  // ========== Component ==========

  return (
    <Formik<ProductFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        await onSubmit(values);
      }}
    >
      {({ errors, handleBlur, handleChange, setFieldTouched, setFieldValue, submitCount, touched, values }) => {
        const imageSource = imagePreviewUrl ?? currentImageUrl;
        const hasImage = Boolean(imageSource);
        const categoryIdInvalid = isFieldInvalid(errors.categoryId, touched.categoryId, submitCount);
        const nameInvalid = isFieldInvalid(errors.name, touched.name, submitCount);
        const priceInvalid = isFieldInvalid(errors.price, touched.price, submitCount);
        const stockQuantityInvalid = isFieldInvalid(errors.stockQuantity, touched.stockQuantity, submitCount);
        const discountInvalid = isFieldInvalid(errors.discount, touched.discount, submitCount);
        const descriptionInvalid = isFieldInvalid(errors.description, touched.description, submitCount);

        return (
          <Form className="mt-4 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2 md:items-start">
              <FormField label={t('form.nameLabel')} required error={nameInvalid}>
                <Input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t('form.namePlaceholder')}
                  error={nameInvalid}
                />
              </FormField>

              <FormField label={t('form.categoryLabel')} required error={categoryIdInvalid}>
                <Select
                  value={values.categoryId}
                  onValueChange={value => {
                    setFieldValue('categoryId', value);
                    setFieldTouched('categoryId', true, false);
                  }}
                  onBlur={() => setFieldTouched('categoryId', true, false)}
                  options={categoryOptions}
                  placeholder={t('form.categoryPlaceholder')}
                  error={categoryIdInvalid}
                />
              </FormField>

              <FormField label={t('form.priceLabel')} required error={priceInvalid}>
                <Input
                  name="price"
                  value={values.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  type="number"
                  min="0"
                  step="0.01"
                  error={priceInvalid}
                />
              </FormField>

              <FormField label={t('form.stockLabel')} required error={stockQuantityInvalid}>
                <Input
                  name="stockQuantity"
                  value={values.stockQuantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  type="number"
                  min="0"
                  step="1"
                  error={stockQuantityInvalid}
                />
              </FormField>

              <FormField label={t('form.discountLabel')} required error={discountInvalid}>
                <Input
                  name="discount"
                  value={values.discount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  error={discountInvalid}
                />
              </FormField>
            </div>

            <FormField label={t('form.descriptionLabel')} error={descriptionInvalid}>
              <Textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('form.descriptionPlaceholder')}
                error={descriptionInvalid}
              />
            </FormField>

            <FormField label={t('form.image.label')} error={Boolean(imageErrorMessage)}>
              <div className="grid gap-3">
                <ProductImage
                  src={imageSource}
                  alt={values.name || t('form.image.label')}
                  fallbackLabel={t('form.image.noImage')}
                  className="aspect-16/10 max-w-xl"
                  sizes="(max-width: 768px) 100vw, 640px"
                />

                <FileDropzone
                  value={imageFile}
                  previewUrl={imagePreviewUrl}
                  accept={{
                    'image/jpeg': ['.jpg', '.jpeg'],
                    'image/png': ['.png'],
                    'image/webp': ['.webp'],
                  }}
                  maxSize={5 * 1024 * 1024}
                  error={imageErrorMessage ?? undefined}
                  title={hasImage ? t('form.image.replaceButton') : t('form.image.uploadButton')}
                  description={t('form.image.hint')}
                  selectedFileLabel={t('form.image.selectedFile')}
                  removeLabel={t('form.image.clearSelectedButton')}
                  onChange={onImageSelected}
                />

                {mode === 'edit' && currentImageUrl ? (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void onRemoveImage()}
                    disabled={isImageRemoving}
                  >
                    {isImageRemoving ? t('form.image.removing') : t('form.image.removeButton')}
                  </Button>
                ) : null}

                {imageErrorMessage ? <p className="text-sm text-danger">{imageErrorMessage}</p> : null}
              </div>
            </FormField>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t('form.submitting')
                  : mode === 'edit'
                    ? t('form.updateButton')
                    : t('form.createButton')}
              </Button>

              {mode === 'edit' ? (
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                  {t('form.cancelButton')}
                </Button>
              ) : null}
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
