import * as yup from 'yup';

// ========== Types ==========

export type AdminSoldProductsReportValidationMessages = {
  dateRequired: string;
};

// ========== Schemas ==========

export function createAdminSoldProductsReportSchema(messages: AdminSoldProductsReportValidationMessages) {
  return yup.object({
    date: yup.string().required(messages.dateRequired),
  });
}
