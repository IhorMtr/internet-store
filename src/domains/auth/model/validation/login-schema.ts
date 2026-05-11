import * as yup from "yup";
import type { LoginFormValues } from "@/domains/auth/model/types/login-form.types";

// ========== Types ==========
export type LoginValidationMessages = {
  emailInvalid: string;
  emailRequired: string;
  passwordRequired: string;
};

// ========== Exports ==========
export function createLoginSchema(
  messages: LoginValidationMessages,
): yup.ObjectSchema<LoginFormValues> {
  return yup.object({
    email: yup
      .string()
      .email(messages.emailInvalid)
      .required(messages.emailRequired),
    password: yup.string().required(messages.passwordRequired),
  });
}
