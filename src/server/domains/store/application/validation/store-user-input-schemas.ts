import * as yup from 'yup';
import { PAYMENT_METHOD_VALUES } from '@/shared/lib/payment-method';

// ===================== Helpers =====================

function optionalTrimmedString() {
  return yup
    .string()
    .transform(value => (typeof value === 'string' ? value.trim() : value))
    .nullable()
    .default(null)
    .transform(value => (value === '' ? null : value));
}

function requiredTrimmedString() {
  return yup.string().trim().min(1).required();
}

function positiveInteger() {
  return yup.number().integer().moreThan(0).required();
}

// ===================== Schemas =====================

export const storeUserCreateOrderInputSchema = yup
  .object({
    items: yup
      .array(
        yup
          .object({
            productId: positiveInteger(),
            quantity: positiveInteger(),
          })
          .required()
      )
      .min(1)
      .required(),
    shipment: yup
      .object({
        shippingService: requiredTrimmedString(),
        trackingNumber: optionalTrimmedString(),
        shippingAddress: requiredTrimmedString(),
        shippingStatus: yup
          .string()
          .transform(value => (typeof value === 'string' ? value.trim() : value))
          .nullable()
          .default('processing')
          .transform(value => (value === null || value === '' ? 'processing' : value)),
      })
      .nullable()
      .default(null),
    paymentMethod: yup
      .mixed<(typeof PAYMENT_METHOD_VALUES)[number]>()
      .oneOf([...PAYMENT_METHOD_VALUES])
      .required(),
  })
  .required();

export const storeUserPaymentInputSchema = yup
  .object({
    paymentMethod: yup
      .string()
      .oneOf([...PAYMENT_METHOD_VALUES])
      .nullable()
      .default(null),
  })
  .required();
