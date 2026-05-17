'use client';

import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { createAdminSoldProductsReportSchema } from '@/domains/admin/model/validation';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { FormField } from '@/shared/ui/form-field';

// ========== Types ==========

type SoldProductsReportFormValues = {
  date: string;
};

type AdminSoldProductsReportFormProps = {
  initialValues: SoldProductsReportFormValues;
  isSubmitting: boolean;
  onSubmit: (values: SoldProductsReportFormValues) => Promise<void>;
};

// ========== Helpers ==========

function isFieldInvalid(error: unknown, isTouched: unknown, submitCount: number) {
  return Boolean((isTouched || submitCount > 0) && error);
}

// ========== Component ==========

export function AdminSoldProductsReportForm({ initialValues, isSubmitting, onSubmit }: AdminSoldProductsReportFormProps) {
  // ========== Translations ==========

  const t = useTranslations('AdminReports');

  // ========== Schemas ==========

  const validationSchema = createAdminSoldProductsReportSchema({
    dateRequired: t('soldProducts.validation.dateRequired'),
  });

  // ========== Render ==========

  return (
    <Formik<SoldProductsReportFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        await onSubmit(values);
      }}
    >
      {({ errors, setFieldTouched, setFieldValue, submitCount, touched, values }) => {
        const dateInvalid = isFieldInvalid(errors.date, touched.date, submitCount);

        return (
          <Form className="flex flex-wrap items-end gap-3">
            <FormField
              className="w-full sm:w-64"
              label={t('soldProducts.dateLabel')}
              required
              error={dateInvalid}
            >
              <DatePicker
                value={values.date}
                onChange={value => {
                  setFieldValue('date', value);
                  setFieldTouched('date', true, false);
                }}
                onBlur={() => setFieldTouched('date', true, false)}
                error={dateInvalid}
              />
            </FormField>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('soldProducts.generating') : t('soldProducts.applyButton')}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
}
