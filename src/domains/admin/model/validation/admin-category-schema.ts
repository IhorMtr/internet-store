import * as yup from 'yup';

// ========== Types ==========

export type AdminCategoryValidationMessages = {
  nameRequired: string;
  descriptionTooLong: string;
};

// ========== Schemas ==========

export function createAdminCategorySchema(messages: AdminCategoryValidationMessages) {
  return yup.object({
    categoryName: yup.string().trim().required(messages.nameRequired),
    description: yup.string().max(1000, messages.descriptionTooLong),
  });
}
