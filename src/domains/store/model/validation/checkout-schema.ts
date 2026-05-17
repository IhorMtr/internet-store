import * as yup from 'yup';
import { PAYMENT_METHOD_VALUES } from '@/shared/lib/payment-method';

// ========== Types ==========

export type CheckoutValidationMessages = {
  shippingServiceRequired: string;
  shippingAddressRequired: string;
  paymentMethodRequired: string;
};

// ========== Schemas ==========

export function createCheckoutSchema(messages: CheckoutValidationMessages) {
  return yup.object({
    shippingService: yup.string().trim().required(messages.shippingServiceRequired),
    shippingAddress: yup.string().trim().required(messages.shippingAddressRequired),
    paymentMethod: yup
      .string()
      .oneOf([...PAYMENT_METHOD_VALUES], messages.paymentMethodRequired)
      .required(messages.paymentMethodRequired),
  });
}
