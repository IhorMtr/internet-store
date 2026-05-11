'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { createAdminProductSchema } from '@/domains/admin/model/validation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import type { SelectOption } from '@/shared/ui/select';
import { Select } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
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
  initialValues: ProductFormValues;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
};

// ========== Helpers ==========

function isFieldInvalid(error: unknown, isTouched: unknown, submitCount: number) {
  return Boolean((isTouched || submitCount > 0) && error);
}

// ========== Component ==========

export function AdminProductForm({
  categoryOptions,
  initialValues,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
}: AdminProductFormProps) {
  // ========== Translations ==========

  const t = useTranslations('AdminProducts');

  // ========== Schemas ==========

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

  // ========== Render ==========

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
