'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { createAdminShipmentSchema } from '@/domains/admin/model/validation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select, type SelectOption } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

// ========== Types ==========

type ShipmentFormValues = {
  shippingService: string;
  trackingNumber: string;
  shippingAddress: string;
  shippingStatus: string;
};

type AdminShipmentFormProps = {
  initialValues: ShipmentFormValues;
  isCreating: boolean;
  isUpdating: boolean;
  onCreate: (values: ShipmentFormValues) => Promise<void>;
  onUpdate: (values: ShipmentFormValues) => Promise<void>;
};

// ========== Form Helpers ==========

function isFieldInvalid(error: unknown, isTouched: unknown, submitCount: number) {
  return Boolean((isTouched || submitCount > 0) && error);
}

// ========== Component ==========

export function AdminShipmentForm({
  initialValues,
  isCreating,
  isUpdating,
  onCreate,
  onUpdate,
}: AdminShipmentFormProps) {
  // ========== Translations ==========

  const t = useTranslations('AdminOrderDetails');

  // ========== Validation ==========

  const validationSchema = createAdminShipmentSchema({
    serviceRequired: t('shipmentForm.validation.serviceRequired'),
    trackingRequired: t('shipmentForm.validation.trackingRequired'),
    addressRequired: t('shipmentForm.validation.addressRequired'),
    statusRequired: t('shipmentForm.validation.statusRequired'),
  });

  // ========== Component ==========

  return (
    <Formik<ShipmentFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        await onCreate(values);
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        setFieldTouched,
        setFieldValue,
        setTouched,
        submitCount,
        touched,
        validateForm,
        values,
      }) => {
        const baseShippingStatusOptions: SelectOption[] = [
          { label: t('shipmentForm.statusOptions.created'), value: 'created' },
          { label: t('shipmentForm.statusOptions.processing'), value: 'processing' },
          { label: t('shipmentForm.statusOptions.inTransit'), value: 'in_transit' },
          { label: t('shipmentForm.statusOptions.delivered'), value: 'delivered' },
          { label: t('shipmentForm.statusOptions.cancelled'), value: 'cancelled' },
        ];

        const shippingServiceInvalid = isFieldInvalid(errors.shippingService, touched.shippingService, submitCount);
        const trackingNumberInvalid = isFieldInvalid(errors.trackingNumber, touched.trackingNumber, submitCount);
        const shippingAddressInvalid = isFieldInvalid(errors.shippingAddress, touched.shippingAddress, submitCount);
        const shippingStatusInvalid = isFieldInvalid(errors.shippingStatus, touched.shippingStatus, submitCount);

        const currentStatus = values.shippingStatus.trim();
        const shippingStatusOptions =
          currentStatus && !baseShippingStatusOptions.some(option => option.value === currentStatus)
            ? [{ label: currentStatus, value: currentStatus }, ...baseShippingStatusOptions]
            : baseShippingStatusOptions;

        return (
          <Form className="mt-4 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2 md:items-start">
              <FormField label={t('shipmentForm.serviceLabel')} required error={shippingServiceInvalid}>
                <Input
                  name="shippingService"
                  value={values.shippingService}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t('shipmentForm.servicePlaceholder')}
                  error={shippingServiceInvalid}
                />
              </FormField>

              <FormField label={t('shipmentForm.trackingLabel')} required error={trackingNumberInvalid}>
                <Input
                  name="trackingNumber"
                  value={values.trackingNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t('shipmentForm.trackingPlaceholder')}
                  error={trackingNumberInvalid}
                />
              </FormField>
            </div>

            <FormField label={t('shipmentForm.addressLabel')} required error={shippingAddressInvalid}>
              <Textarea
                name="shippingAddress"
                value={values.shippingAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('shipmentForm.addressPlaceholder')}
                error={shippingAddressInvalid}
              />
            </FormField>

            <FormField label={t('shipmentForm.statusLabel')} required error={shippingStatusInvalid}>
              <Select
                value={values.shippingStatus}
                onValueChange={value => {
                  setFieldValue('shippingStatus', value);
                  setFieldTouched('shippingStatus', true, false);
                }}
                onBlur={() => setFieldTouched('shippingStatus', true, false)}
                options={shippingStatusOptions}
                placeholder={t('shipmentForm.statusPlaceholder')}
                error={shippingStatusInvalid}
              />
            </FormField>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? t('shipmentForm.creating') : t('shipmentForm.createButton')}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  const nextErrors = await validateForm();

                  if (Object.keys(nextErrors).length > 0) {
                    setTouched(
                      {
                        shippingService: true,
                        trackingNumber: true,
                        shippingAddress: true,
                        shippingStatus: true,
                      },
                      true
                    );
                    return;
                  }

                  await onUpdate(values);
                }}
                disabled={isUpdating}
              >
                {isUpdating ? t('shipmentForm.updating') : t('shipmentForm.updateButton')}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
