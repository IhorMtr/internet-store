import * as yup from 'yup';
import { PAYMENT_METHOD_VALUES } from '@/shared/lib/payment-method';

// ========== Types ==========

export type AdminPaymentValidationMessages = {
  methodRequired: string;
};

// ========== Schemas ==========

export function createAdminPaymentSchema(messages: AdminPaymentValidationMessages) {
  return yup.object({
    paymentMethod: yup
      .string()
      .trim()
      .oneOf([...PAYMENT_METHOD_VALUES], messages.methodRequired)
      .required(messages.methodRequired),
  });
}
