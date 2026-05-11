'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { createAdminPaymentSchema } from '@/domains/admin/model/validation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

// ========== Types ==========

type PaymentFormValues = {
  paymentMethod: string;
};

type AdminPaymentFormProps = {
  initialValues: PaymentFormValues;
  isSubmitting: boolean;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
};

// ========== Helpers ==========

function isFieldInvalid(error: unknown, isTouched: unknown, submitCount: number) {
  return Boolean((isTouched || submitCount > 0) && error);
}

// ========== Component ==========

export function AdminPaymentForm({ initialValues, isSubmitting, onSubmit }: AdminPaymentFormProps) {
  // ========== Translations ==========

  const t = useTranslations('AdminOrderDetails');

  // ========== Schemas ==========

  const validationSchema = createAdminPaymentSchema({
    methodRequired: t('paymentForm.validation.methodRequired'),
  });

  // ========== Render ==========

  return (
    <Formik<PaymentFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        await onSubmit(values);
        helpers.resetForm();
      }}
    >
      {({ errors, handleBlur, handleChange, submitCount, touched, values }) => {
        const paymentMethodInvalid = isFieldInvalid(errors.paymentMethod, touched.paymentMethod, submitCount);

        return (
          <Form className="mt-4 grid gap-3 md:max-w-md">
            <FormField label={t('paymentForm.methodLabel')} required error={paymentMethodInvalid}>
              <Input
                name="paymentMethod"
                value={values.paymentMethod}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('paymentForm.methodPlaceholder')}
                error={paymentMethodInvalid}
              />
            </FormField>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('paymentForm.submitting') : t('paymentForm.submitButton')}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
}
