'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { createAdminCategorySchema } from '@/domains/admin/model/validation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

// ========== Types ==========

type CategoryFormValues = {
  categoryName: string;
  description: string;
};

type AdminCategoryFormProps = {
  initialValues: CategoryFormValues;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

// ========== Helpers ==========

function isFieldInvalid(error: unknown, isTouched: unknown, submitCount: number) {
  return Boolean((isTouched || submitCount > 0) && error);
}

// ========== Component ==========

export function AdminCategoryForm({ initialValues, isSubmitting, mode, onCancel, onSubmit }: AdminCategoryFormProps) {
  // ========== Translations ==========

  const t = useTranslations('AdminCategories');

  // ========== Schemas ==========

  const validationSchema = createAdminCategorySchema({
    nameRequired: t('validation.nameRequired'),
    descriptionTooLong: t('validation.descriptionTooLong'),
  });

  // ========== Render ==========

  return (
    <Formik<CategoryFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        await onSubmit(values);
      }}
    >
      {({ errors, handleBlur, handleChange, submitCount, touched, values }) => {
        const categoryNameInvalid = isFieldInvalid(errors.categoryName, touched.categoryName, submitCount);
        const descriptionInvalid = isFieldInvalid(errors.description, touched.description, submitCount);

        return (
          <Form className="mt-4 grid gap-3">
            <FormField label={t('form.nameLabel')} required error={categoryNameInvalid}>
              <Input
                name="categoryName"
                value={values.categoryName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('form.namePlaceholder')}
                error={categoryNameInvalid}
              />
            </FormField>

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
