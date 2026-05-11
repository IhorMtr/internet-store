import * as yup from 'yup';

// ========== Types ==========

export type AdminPaymentValidationMessages = {
  methodRequired: string;
};

// ========== Schemas ==========

export function createAdminPaymentSchema(messages: AdminPaymentValidationMessages) {
  return yup.object({
    paymentMethod: yup.string().trim().required(messages.methodRequired),
  });
}
