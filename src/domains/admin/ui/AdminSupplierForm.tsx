'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { createAdminSupplierSchema } from '@/domains/admin/model/validation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

// ========== Types ==========

type SupplierFormValues = {
  name: string;
  phoneNumber: string;
  email: string;
};

type AdminSupplierFormProps = {
  initialValues: SupplierFormValues;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSubmit: (values: SupplierFormValues) => Promise<void>;
};

// ========== Helpers ==========

function isFieldInvalid(error: unknown, isTouched: unknown, submitCount: number) {
  return Boolean((isTouched || submitCount > 0) && error);
}

// ========== Component ==========

export function AdminSupplierForm({ initialValues, isSubmitting, mode, onCancel, onSubmit }: AdminSupplierFormProps) {
  // ========== Translations ==========

  const t = useTranslations('AdminSuppliers');

  // ========== Schemas ==========

  const validationSchema = createAdminSupplierSchema({
    nameRequired: t('validation.nameRequired'),
    phoneInvalid: t('validation.phoneInvalid'),
    emailInvalid: t('validation.emailInvalid'),
    emailTooLong: t('validation.emailTooLong'),
  });

  // ========== Render ==========

  return (
    <Formik<SupplierFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        await onSubmit(values);
      }}
    >
      {({ errors, handleBlur, handleChange, submitCount, touched, values }) => {
        const nameInvalid = isFieldInvalid(errors.name, touched.name, submitCount);
        const phoneInvalid = isFieldInvalid(errors.phoneNumber, touched.phoneNumber, submitCount);
        const emailInvalid = isFieldInvalid(errors.email, touched.email, submitCount);

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

              <FormField label={t('form.phoneLabel')} error={phoneInvalid}>
                <Input
                  name="phoneNumber"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="tel"
                  inputMode="numeric"
                  mask="ukrainian-phone"
                  placeholder={t('form.phonePlaceholder')}
                  error={phoneInvalid}
                />
              </FormField>

              <FormField label={t('form.emailLabel')} className="md:col-span-2" error={emailInvalid}>
                <Input
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  type="email"
                  placeholder={t('form.emailPlaceholder')}
                  error={emailInvalid}
                />
              </FormField>
            </div>

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
