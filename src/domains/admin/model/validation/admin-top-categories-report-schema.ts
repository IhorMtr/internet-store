import * as yup from 'yup';

// ========== Types ==========

export type AdminTopCategoriesReportValidationMessages = {
  dateFromRequired: string;
  dateToRequired: string;
  dateRangeInvalid: string;
};

// ========== Schemas ==========

export function createAdminTopCategoriesReportSchema(messages: AdminTopCategoriesReportValidationMessages) {
  return yup.object({
    dateFrom: yup.string().required(messages.dateFromRequired),
    dateTo: yup
      .string()
      .required(messages.dateToRequired)
      .test('date-range', messages.dateRangeInvalid, function validateDateTo(value) {
        const dateFrom = this.parent.dateFrom;

        if (!dateFrom || !value) {
          return true;
        }

        return new Date(dateFrom).getTime() <= new Date(value).getTime();
      }),
  });
}
