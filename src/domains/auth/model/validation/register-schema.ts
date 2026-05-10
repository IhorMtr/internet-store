import * as yup from "yup";
import type { RegisterFormValues } from "@/domains/auth/model/types/register-form.types";

// ===================== TYPES =====================
export type RegisterValidationMessages = {
  emailInvalid: string;
  emailRequired: string;
  passwordMinLength: string;
  passwordRequired: string;
};

// ===================== EXPORTS =====================
export function createRegisterSchema(
  messages: RegisterValidationMessages,
): yup.ObjectSchema<RegisterFormValues> {
  return yup.object({
    email: yup
      .string()
      .email(messages.emailInvalid)
      .required(messages.emailRequired),
    fullName: yup.string().default(""),
    password: yup
      .string()
      .min(8, messages.passwordMinLength)
      .required(messages.passwordRequired),
  });
}
