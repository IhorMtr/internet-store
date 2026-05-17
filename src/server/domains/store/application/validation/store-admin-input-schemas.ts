import * as yup from 'yup';
import { PAYMENT_METHOD_VALUES } from '@/shared/lib/payment-method';

// ===================== Helpers =====================

function optionalTrimmedString() {
  return yup
    .string()
    .transform(value => (typeof value === 'string' ? value.trim() : value))
    .nullable()
    .default(null)
    .test('empty-to-null', '', value => value === null || value.length >= 0)
    .transform(value => (value === '' ? null : value));
}

function requiredTrimmedString() {
  return yup.string().trim().min(1).required();
}

function positiveInteger() {
  return yup.number().integer().moreThan(0).required();
}

const dateStringSchema = yup
  .string()
  .trim()
  .required()
  .matches(/^\d{4}-\d{2}-\d{2}$/)
  .test('valid-date', '', value => {
    if (!value) {
      return false;
    }

    return !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
  });

// ===================== Schemas =====================

export const storeAdminCategoryInputSchema = yup
  .object({
    categoryName: requiredTrimmedString(),
    description: optionalTrimmedString(),
  })
  .required();

export const storeAdminProductInputSchema = yup
  .object({
    categoryId: positiveInteger(),
    name: requiredTrimmedString(),
    price: yup.number().moreThan(0).required(),
    stockQuantity: yup.number().integer().min(0).required(),
    discount: yup.number().min(0).max(100).required(),
    description: optionalTrimmedString(),
  })
  .required();

export const storeAdminSupplierInputSchema = yup
  .object({
    name: requiredTrimmedString(),
    phoneNumber: optionalTrimmedString(),
    email: optionalTrimmedString(),
  })
  .required();

export const storeAdminShipmentInputSchema = yup
  .object({
    shippingService: requiredTrimmedString(),
    trackingNumber: requiredTrimmedString(),
    shippingAddress: requiredTrimmedString(),
    shippingStatus: requiredTrimmedString(),
  })
  .required();

export const storeAdminPaymentInputSchema = yup
  .object({
    paymentMethod: yup
      .mixed<(typeof PAYMENT_METHOD_VALUES)[number]>()
      .oneOf([...PAYMENT_METHOD_VALUES])
      .required(),
  })
  .required();

export const storeAdminDeliveryInputSchema = yup
  .object({
    supplierId: positiveInteger(),
    deliveryDate: dateStringSchema,
    invoiceNumber: requiredTrimmedString(),
    items: yup
      .array(
        yup
          .object({
            productId: positiveInteger(),
            quantity: positiveInteger(),
            supplyPrice: yup.number().moreThan(0).required(),
          })
          .required()
      )
      .min(1)
      .required(),
  })
  .required();

export const storeAdminReportDateSchema = dateStringSchema;
