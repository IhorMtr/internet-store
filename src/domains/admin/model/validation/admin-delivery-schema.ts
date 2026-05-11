import * as yup from 'yup';

// ========== Types ==========

export type AdminDeliveryValidationMessages = {
  supplierRequired: string;
  dateRequired: string;
  invoiceRequired: string;
  itemsRequired: string;
  productRequired: string;
  quantityRequired: string;
  quantityInvalid: string;
  priceRequired: string;
  priceInvalid: string;
};

// ========== Helpers ==========

function toNumber(value: string) {
  return Number(value);
}

// ========== Schemas ==========

export function createAdminDeliverySchema(messages: AdminDeliveryValidationMessages) {
  return yup.object({
    supplierId: yup
      .string()
      .required(messages.supplierRequired)
      .test('supplier-id', messages.supplierRequired, value => toNumber(value ?? '') > 0),
    deliveryDate: yup.string().required(messages.dateRequired),
    invoiceNumber: yup.string().trim().required(messages.invoiceRequired),
    items: yup
      .array()
      .of(
        yup.object({
          productId: yup
            .string()
            .required(messages.productRequired)
            .test('product-id', messages.productRequired, value => toNumber(value ?? '') > 0),
          quantity: yup
            .string()
            .required(messages.quantityRequired)
            .test('quantity-int', messages.quantityInvalid, value => Number.isInteger(toNumber(value ?? '')))
            .test('quantity-min', messages.quantityInvalid, value => toNumber(value ?? '') > 0),
          supplyPrice: yup
            .string()
            .required(messages.priceRequired)
            .test('price-number', messages.priceInvalid, value => !Number.isNaN(toNumber(value ?? '')))
            .test('price-min', messages.priceInvalid, value => toNumber(value ?? '') >= 0),
        })
      )
      .min(1, messages.itemsRequired),
  });
}
