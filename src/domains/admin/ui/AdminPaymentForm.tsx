'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { createAdminPaymentSchema } from '@/domains/admin/model/validation';
import {
  createPaymentMethodLabels,
  createPaymentMethodOptions,
  type PaymentMethod,
} from '@/shared/lib/payment-method';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Select } from '@/shared/ui/select';

// ========== Types ==========

type PaymentFormValues = {
  paymentMethod: PaymentMethod;
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
  const paymentMethodT = useTranslations('PaymentMethods');

  // ========== Schemas ==========

  const validationSchema = createAdminPaymentSchema({
    methodRequired: t('paymentForm.validation.methodRequired'),
  });
  const paymentMethodLabels = createPaymentMethodLabels(key => paymentMethodT(key));
  const paymentMethodOptions = createPaymentMethodOptions(paymentMethodLabels);

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
      {({ errors, setFieldTouched, setFieldValue, submitCount, touched, values }) => {
        const paymentMethodInvalid = isFieldInvalid(errors.paymentMethod, touched.paymentMethod, submitCount);

        return (
          <Form className="mt-4 grid gap-3 md:max-w-md">
            <FormField label={t('paymentForm.methodLabel')} required error={paymentMethodInvalid}>
              <Select
                name="paymentMethod"
                value={values.paymentMethod}
                onValueChange={value => {
                  setFieldValue('paymentMethod', value);
                  setFieldTouched('paymentMethod', true, false);
                }}
                onBlur={() => setFieldTouched('paymentMethod', true, false)}
                options={paymentMethodOptions}
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
