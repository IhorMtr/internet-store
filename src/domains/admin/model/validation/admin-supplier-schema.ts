import * as yup from 'yup';
import { UKRAINIAN_PHONE_REGEX } from '@/shared/lib/ukrainian-phone';

// ========== Types ==========

export type AdminSupplierValidationMessages = {
  nameRequired: string;
  phoneInvalid: string;
  emailInvalid: string;
  emailTooLong: string;
};

// ========== Schemas ==========

export function createAdminSupplierSchema(messages: AdminSupplierValidationMessages) {
  return yup.object({
    name: yup.string().trim().required(messages.nameRequired),
    phoneNumber: yup
      .string()
      .trim()
      .test('phone-format', messages.phoneInvalid, value => !value || UKRAINIAN_PHONE_REGEX.test(value)),
    email: yup.string().email(messages.emailInvalid).max(255, messages.emailTooLong),
  });
}
