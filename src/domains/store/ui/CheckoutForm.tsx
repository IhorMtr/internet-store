'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { createCheckoutSchema } from '@/domains/store/model/validation';
import { createPaymentMethodLabels, createPaymentMethodOptions, type PaymentMethod } from '@/shared/lib/payment-method';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Select, type SelectOption } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

// ========== Types ==========

export type CheckoutFormValues = {
  shippingService: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
};

type CheckoutFormProps = {
  initialValues: CheckoutFormValues;
  isSubmitting: boolean;
  isSubmitDisabled?: boolean;
  onSubmit: (values: CheckoutFormValues) => Promise<void>;
};

// ========== Form Helpers ==========

function isFieldInvalid(error: unknown, isTouched: unknown, submitCount: number) {
  return Boolean((isTouched || submitCount > 0) && error);
}

// ========== Component ==========

export function CheckoutForm({ initialValues, isSubmitting, isSubmitDisabled = false, onSubmit }: CheckoutFormProps) {
  // ========== Translations ==========

  const t = useTranslations('Checkout');
  const paymentMethodT = useTranslations('PaymentMethods');

  // ========== Validation ==========

  const validationSchema = createCheckoutSchema({
    shippingServiceRequired: t('validation.shippingServiceRequired'),
    shippingAddressRequired: t('validation.shippingAddressRequired'),
    paymentMethodRequired: t('validation.paymentMethodRequired'),
  });
  const paymentMethodLabels = createPaymentMethodLabels(key => paymentMethodT(key));
  const paymentMethodOptions = createPaymentMethodOptions(paymentMethodLabels);

  // ========== Component ==========

  return (
    <Formik<CheckoutFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async values => {
        try {
          await onSubmit(values);
        } catch {
          // Query/mutation layer already normalizes and displays API errors.
        }
      }}
    >
      {({ errors, handleBlur, handleChange, setFieldTouched, setFieldValue, submitCount, touched, values }) => {
        const shippingServiceOptions: SelectOption[] = [
          { label: t('form.shippingServiceOptions.novaPoshta'), value: 'nova_poshta' },
          { label: t('form.shippingServiceOptions.ukrposhta'), value: 'ukrposhta' },
          { label: t('form.shippingServiceOptions.meest'), value: 'meest' },
        ];

        const shippingServiceInvalid = isFieldInvalid(errors.shippingService, touched.shippingService, submitCount);
        const shippingAddressInvalid = isFieldInvalid(errors.shippingAddress, touched.shippingAddress, submitCount);
        const paymentMethodInvalid = isFieldInvalid(errors.paymentMethod, touched.paymentMethod, submitCount);

        return (
          <Form className="grid gap-4">
            <section className="grid gap-4">
              <h3 className="text-sm font-semibold text-primary">{t('form.shippingSectionTitle')}</h3>

              <FormField label={t('form.shippingServiceLabel')} required error={shippingServiceInvalid}>
                <Select
                  name="shippingService"
                  value={values.shippingService}
                  onValueChange={value => {
                    setFieldValue('shippingService', value);
                    setFieldTouched('shippingService', true, false);
                  }}
                  onBlur={() => setFieldTouched('shippingService', true, false)}
                  options={shippingServiceOptions}
                  placeholder={t('form.shippingServicePlaceholder')}
                  error={shippingServiceInvalid}
                />
              </FormField>

              <FormField label={t('form.shippingAddressLabel')} required error={shippingAddressInvalid}>
                <Textarea
                  name="shippingAddress"
                  value={values.shippingAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t('form.shippingAddressPlaceholder')}
                  error={shippingAddressInvalid}
                />
              </FormField>
            </section>

            <section className="grid gap-4">
              <h3 className="text-sm font-semibold text-primary">{t('form.paymentSectionTitle')}</h3>

              <FormField label={t('form.paymentMethodLabel')} required error={paymentMethodInvalid}>
                <Select
                  name="paymentMethod"
                  value={values.paymentMethod}
                  onValueChange={value => {
                    setFieldValue('paymentMethod', value);
                    setFieldTouched('paymentMethod', true, false);
                  }}
                  onBlur={() => setFieldTouched('paymentMethod', true, false)}
                  options={paymentMethodOptions}
                  placeholder={t('form.paymentMethodPlaceholder')}
                  error={paymentMethodInvalid}
                />
              </FormField>
            </section>

            <Button type="submit" disabled={isSubmitting || isSubmitDisabled}>
              {isSubmitting ? t('form.submitting') : t('form.submit')}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
}
