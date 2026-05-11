import * as yup from 'yup';

// ========== Types ==========

export type AdminProductValidationMessages = {
  categoryRequired: string;
  nameRequired: string;
  priceRequired: string;
  priceInvalid: string;
  stockRequired: string;
  stockInvalid: string;
  discountRequired: string;
  discountInvalid: string;
  discountRange: string;
  descriptionTooLong: string;
};

// ========== Helpers ==========

function toNumber(value: string) {
  return Number(value);
}

// ========== Schemas ==========

export function createAdminProductSchema(messages: AdminProductValidationMessages) {
  return yup.object({
    categoryId: yup
      .string()
      .required(messages.categoryRequired)
      .test('category-id', messages.categoryRequired, value => toNumber(value ?? '') > 0),
    name: yup.string().trim().required(messages.nameRequired),
    price: yup
      .string()
      .required(messages.priceRequired)
      .test('price-number', messages.priceInvalid, value => !Number.isNaN(toNumber(value ?? '')))
      .test('price-min', messages.priceInvalid, value => toNumber(value ?? '') >= 0),
    stockQuantity: yup
      .string()
      .required(messages.stockRequired)
      .test('stock-number', messages.stockInvalid, value => Number.isInteger(toNumber(value ?? '')))
      .test('stock-min', messages.stockInvalid, value => toNumber(value ?? '') >= 0),
    discount: yup
      .string()
      .required(messages.discountRequired)
      .test('discount-number', messages.discountInvalid, value => Number.isInteger(toNumber(value ?? '')))
      .test(
        'discount-range',
        messages.discountRange,
        value => toNumber(value ?? '') >= 0 && toNumber(value ?? '') <= 100
      ),
    description: yup.string().max(2000, messages.descriptionTooLong),
  });
}
