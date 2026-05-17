import * as yup from 'yup';
import { PAYMENT_METHOD_VALUES } from '@/shared/lib/payment-method';

// ========== Types ==========

export type PaymentValidationMessages = {
  paymentMethodRequired: string;
};

// ========== Schemas ==========

export function createPaymentSchema(messages: PaymentValidationMessages) {
  return yup.object({
    paymentMethod: yup
      .string()
      .trim()
      .oneOf([...PAYMENT_METHOD_VALUES], messages.paymentMethodRequired)
      .required(messages.paymentMethodRequired),
  });
}
