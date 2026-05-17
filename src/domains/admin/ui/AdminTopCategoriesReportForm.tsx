'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { createAdminTopCategoriesReportSchema } from '@/domains/admin/model/validation';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { FormField } from '@/shared/ui/form-field';

// ========== Types ==========

type TopCategoriesReportFormValues = {
  dateFrom: string;
  dateTo: string;
};

type AdminTopCategoriesReportFormProps = {
  initialValues: TopCategoriesReportFormValues;
  isSubmitting: boolean;
  onSubmit: (values: TopCategoriesReportFormValues) => Promise<void>;
};

// ========== Helpers ==========

function isFieldInvalid(error: unknown, isTouched: unknown, submitCount: number) {
  return Boolean((isTouched || submitCount > 0) && error);
}

// ========== Component ==========

export function AdminTopCategoriesReportForm({ initialValues, isSubmitting, onSubmit }: AdminTopCategoriesReportFormProps) {
  // ========== Translations ==========

  const t = useTranslations('AdminReports');

  // ========== Schemas ==========

  const validationSchema = createAdminTopCategoriesReportSchema({
    dateFromRequired: t('topCategories.validation.dateFromRequired'),
    dateToRequired: t('topCategories.validation.dateToRequired'),
    dateRangeInvalid: t('topCategories.validation.dateRangeInvalid'),
  });

  // ========== Render ==========

  return (
    <Formik<TopCategoriesReportFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        await onSubmit(values);
      }}
    >
      {({ errors, setFieldTouched, setFieldValue, submitCount, touched, values }) => {
        const dateFromInvalid = isFieldInvalid(errors.dateFrom, touched.dateFrom, submitCount);
        const dateToInvalid = isFieldInvalid(errors.dateTo, touched.dateTo, submitCount);

        return (
          <Form className="flex flex-wrap items-end gap-3">
            <FormField
              className="w-full sm:w-64"
              label={t('topCategories.dateFromLabel')}
              required
              error={dateFromInvalid}
            >
              <DatePicker
                value={values.dateFrom}
                onChange={value => {
                  setFieldValue('dateFrom', value);
                  setFieldTouched('dateFrom', true, false);
                }}
                onBlur={() => setFieldTouched('dateFrom', true, false)}
                error={dateFromInvalid}
              />
            </FormField>

            <FormField
              className="w-full sm:w-64"
              label={t('topCategories.dateToLabel')}
              required
              error={dateToInvalid}
            >
              <DatePicker
                value={values.dateTo}
                onChange={value => {
                  setFieldValue('dateTo', value);
                  setFieldTouched('dateTo', true, false);
                }}
                onBlur={() => setFieldTouched('dateTo', true, false)}
                error={dateToInvalid}
              />
            </FormField>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('topCategories.generating') : t('topCategories.applyButton')}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
}
