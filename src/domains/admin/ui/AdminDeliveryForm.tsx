'use client';

import { FieldArray, Form, Formik, getIn } from 'formik';
import { useTranslations } from 'next-intl';
import { createAdminDeliverySchema } from '@/domains/admin/model/validation';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { SearchSelect, type SearchSelectOption } from '@/shared/ui/search-select';
import { Select, type SelectOption } from '@/shared/ui/select';

// ========== Types ==========

type DeliveryItemFormValues = {
  productId: string;
  quantity: string;
  supplyPrice: string;
};

type DeliveryFormValues = {
  supplierId: string;
  deliveryDate: string;
  invoiceNumber: string;
  items: DeliveryItemFormValues[];
};

type AdminDeliveryFormProps = {
  initialValues: DeliveryFormValues;
  isSubmitting: boolean;
  productOptions: SearchSelectOption[];
  supplierOptions: SelectOption[];
  onSubmit: (values: DeliveryFormValues) => Promise<void>;
};

// ========== Constants ==========

const emptyItem: DeliveryItemFormValues = {
  productId: '',
  quantity: '1',
  supplyPrice: '0',
};

// ========== Form Helpers ==========

function isFieldInvalid(error: unknown, isTouched: unknown, submitCount: number) {
  return Boolean((isTouched || submitCount > 0) && error);
}

// ========== Component ==========

export function AdminDeliveryForm({
  initialValues,
  isSubmitting,
  productOptions,
  supplierOptions,
  onSubmit,
}: AdminDeliveryFormProps) {
  // ========== Translations ==========

  const t = useTranslations('AdminDeliveries');

  // ========== Validation ==========

  const validationSchema = createAdminDeliverySchema({
    supplierRequired: t('validation.supplierRequired'),
    dateRequired: t('validation.dateRequired'),
    invoiceRequired: t('validation.invoiceRequired'),
    itemsRequired: t('validation.itemsRequired'),
    productRequired: t('validation.productRequired'),
    quantityRequired: t('validation.quantityRequired'),
    quantityInvalid: t('validation.quantityInvalid'),
    priceRequired: t('validation.priceRequired'),
    priceInvalid: t('validation.priceInvalid'),
  });

  // ========== Component ==========

  return (
    <Formik<DeliveryFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        await onSubmit(values);
        helpers.resetForm();
      }}
    >
      {({ errors, handleBlur, handleChange, setFieldTouched, setFieldValue, submitCount, touched, values }) => {
        const supplierIdInvalid = isFieldInvalid(errors.supplierId, touched.supplierId, submitCount);
        const deliveryDateInvalid = isFieldInvalid(errors.deliveryDate, touched.deliveryDate, submitCount);
        const invoiceNumberInvalid = isFieldInvalid(errors.invoiceNumber, touched.invoiceNumber, submitCount);
        const itemsInvalid = isFieldInvalid(getIn(errors, 'items'), getIn(touched, 'items'), submitCount);
        const minItemsMessage = t('validation.itemsRequired');

        return (
          <Form className="mt-4 grid gap-4">
            <div className="grid gap-3 md:grid-cols-3 md:items-start">
              <FormField label={t('form.supplierLabel')} required error={supplierIdInvalid}>
                <Select
                  value={values.supplierId}
                  onValueChange={value => {
                    setFieldValue('supplierId', value);
                    setFieldTouched('supplierId', true, false);
                  }}
                  onBlur={() => setFieldTouched('supplierId', true, false)}
                  options={supplierOptions}
                  placeholder={t('form.supplierPlaceholder')}
                  error={supplierIdInvalid}
                />
              </FormField>

              <FormField label={t('form.dateLabel')} required error={deliveryDateInvalid}>
                <DatePicker
                  value={values.deliveryDate}
                  onChange={value => {
                    setFieldValue('deliveryDate', value);
                    setFieldTouched('deliveryDate', true, false);
                  }}
                  onBlur={() => setFieldTouched('deliveryDate', true, false)}
                  error={deliveryDateInvalid}
                />
              </FormField>

              <FormField label={t('form.invoiceLabel')} required error={invoiceNumberInvalid}>
                <Input
                  name="invoiceNumber"
                  value={values.invoiceNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t('form.invoicePlaceholder')}
                  error={invoiceNumberInvalid}
                />
              </FormField>
            </div>

            <FieldArray name="items">
              {({ push, remove }) => (
                <div
                  className={cn(
                    'space-y-3 rounded-lg border border-border/70 bg-surface-raised p-3',
                    itemsInvalid && 'border-danger'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-primary">{t('form.itemsTitle')}</p>
                    <Button type="button" size="sm" variant="secondary" onClick={() => push({ ...emptyItem })}>
                      {t('form.addItemButton')}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {values.items.map((item, index) => {
                      const productIdPath = `items.${index}.productId`;
                      const quantityPath = `items.${index}.quantity`;
                      const supplyPricePath = `items.${index}.supplyPrice`;

                      const productIdInvalid = isFieldInvalid(
                        getIn(errors, productIdPath),
                        getIn(touched, productIdPath),
                        submitCount
                      );
                      const quantityInvalid = isFieldInvalid(
                        getIn(errors, quantityPath),
                        getIn(touched, quantityPath),
                        submitCount
                      );
                      const supplyPriceInvalid = isFieldInvalid(
                        getIn(errors, supplyPricePath),
                        getIn(touched, supplyPricePath),
                        submitCount
                      );
                      const canRemoveItem = values.items.length > 1;

                      return (
                        <div key={index} className="rounded-md border border-border/70 p-3">
                          <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
                            <FormField
                              label={t('form.productLabel')}
                              required
                              labelClassName="text-xs text-muted"
                              error={productIdInvalid}
                            >
                              <SearchSelect
                                value={item.productId}
                                onChange={value => {
                                  setFieldValue(productIdPath, value);
                                  setFieldTouched(productIdPath, true, false);
                                }}
                                onBlur={() => setFieldTouched(productIdPath, true, false)}
                                options={productOptions}
                                placeholder={t('form.productPlaceholder')}
                                searchPlaceholder={t('form.productSearchPlaceholder')}
                                emptyText={t('form.productSearchEmpty')}
                                error={productIdInvalid}
                              />
                            </FormField>

                            <FormField
                              label={t('form.quantityLabel')}
                              required
                              labelClassName="text-xs text-muted"
                              error={quantityInvalid}
                            >
                              <Input
                                name={quantityPath}
                                value={item.quantity}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                type="number"
                                min="1"
                                step="1"
                                placeholder={t('form.quantityPlaceholder')}
                                error={quantityInvalid}
                              />
                            </FormField>

                            <FormField
                              label={t('form.supplyPriceLabel')}
                              required
                              labelClassName="text-xs text-muted"
                              error={supplyPriceInvalid}
                            >
                              <Input
                                name={supplyPricePath}
                                value={item.supplyPrice}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={t('form.pricePlaceholder')}
                                error={supplyPriceInvalid}
                              />
                            </FormField>

                            <div className="md:flex md:h-10 md:items-center md:self-end">
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className={cn(
                                  'inline-flex h-10 items-center justify-center rounded-sm px-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:shadow-focus',
                                  canRemoveItem
                                    ? 'text-danger hover:text-danger/85'
                                    : 'cursor-not-allowed text-muted/70'
                                )}
                                disabled={!canRemoveItem}
                                title={!canRemoveItem ? minItemsMessage : undefined}
                                aria-label={
                                  canRemoveItem
                                    ? t('form.removeItemButton')
                                    : `${t('form.removeItemButton')}. ${minItemsMessage}`
                                }
                              >
                                {t('form.removeItemButton')}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </FieldArray>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('form.submitting') : t('form.createButton')}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
