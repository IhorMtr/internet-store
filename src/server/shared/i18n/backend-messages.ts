import type { NextRequest } from 'next/server';

// ===================== TYPES =====================
export type BackendLocale = 'en' | 'uk';

export type BackendMessageKey =
  | 'auth.customerCreateFailed'
  | 'auth.emailAlreadyExists'
  | 'auth.emailInvalid'
  | 'auth.emailRequired'
  | 'auth.invalidCredentials'
  | 'auth.passwordMinLength'
  | 'auth.passwordRequired'
  | 'auth.registrationFailed'
  | 'auth.requestBodyInvalid'
  | 'auth.requestBodyObjectRequired'
  | 'auth.sessionConflict'
  | 'auth.sessionNotActive'
  | 'store.categoryDeleteConflict'
  | 'store.categoryNotFound'
  | 'store.deliveryCreateFailed'
  | 'store.deliveryNotFound'
  | 'store.forbidden'
  | 'store.orderNotFound'
  | 'store.paymentAlreadyExists'
  | 'store.paymentRegisterFailed'
  | 'store.productDeleteConflict'
  | 'store.productNotFound'
  | 'store.requestBodyInvalid'
  | 'store.requestBodyObjectRequired'
  | 'store.shipmentAlreadyExists'
  | 'store.shipmentNotFound'
  | 'store.supplierDeleteConflict'
  | 'store.supplierNotFound'
  | 'store.unauthorized'
  | 'store.validation.dateInvalid'
  | 'store.validation.dateRangeInvalid'
  | 'store.validation.deliveryItemInvalid'
  | 'store.validation.deliveryItemsRequired'
  | 'store.validation.discountRange'
  | 'store.validation.invalidId'
  | 'store.validation.nonEmptyString'
  | 'store.validation.pricePositive'
  | 'store.validation.quantityPositive'
  | 'store.validation.requiredField'
  | 'store.validation.stockNonNegative'
  | 'store.validation.supplyPricePositive'
  | 'common.internalServerError';

// ===================== CONSTANTS =====================
const FALLBACK_LOCALE: BackendLocale = 'en';

const messages: Record<BackendLocale, Partial<Record<BackendMessageKey, string>>> = {
  en: {
    'auth.customerCreateFailed': 'Customer profile could not be created',
    'auth.emailAlreadyExists': 'User with this email already exists',
    'auth.emailInvalid': 'Email is invalid',
    'auth.emailRequired': 'Email is required',
    'auth.invalidCredentials': 'Email or password is incorrect',
    'auth.passwordMinLength': 'Password must contain at least 8 characters',
    'auth.passwordRequired': 'Password is required',
    'auth.registrationFailed': 'Registration could not be completed',
    'auth.requestBodyInvalid': 'Request body must be valid JSON',
    'auth.requestBodyObjectRequired': 'Request body must be an object',
    'auth.sessionConflict': 'Session could not be created. Please try again',
    'auth.sessionNotActive': 'Session is not active',
    'store.categoryDeleteConflict': 'Category cannot be deleted because related products exist',
    'store.categoryNotFound': 'Category was not found',
    'store.deliveryCreateFailed': 'Delivery could not be created',
    'store.deliveryNotFound': 'Delivery was not found',
    'store.forbidden': 'Access denied',
    'store.orderNotFound': 'Order was not found',
    'store.paymentAlreadyExists': 'Payment for this order already exists',
    'store.paymentRegisterFailed': 'Payment could not be registered',
    'store.productDeleteConflict': 'Product cannot be deleted because related records exist',
    'store.productNotFound': 'Product was not found',
    'store.requestBodyInvalid': 'Request body must be valid JSON',
    'store.requestBodyObjectRequired': 'Request body must be an object',
    'store.shipmentAlreadyExists': 'Shipment for this order already exists',
    'store.shipmentNotFound': 'Shipment was not found',
    'store.supplierDeleteConflict': 'Supplier cannot be deleted because related deliveries exist',
    'store.supplierNotFound': 'Supplier was not found',
    'store.unauthorized': 'Authentication required',
    'store.validation.dateInvalid': 'Date must be in YYYY-MM-DD format',
    'store.validation.dateRangeInvalid': 'Date from cannot be later than date to',
    'store.validation.deliveryItemInvalid': 'Each delivery item must be an object',
    'store.validation.deliveryItemsRequired': 'Delivery must contain at least one item',
    'store.validation.discountRange': 'Discount must be between 0 and 100',
    'store.validation.invalidId': 'Identifier must be a positive integer',
    'store.validation.nonEmptyString': 'String fields must be non-empty',
    'store.validation.pricePositive': 'Price must be greater than 0',
    'store.validation.quantityPositive': 'Quantity must be greater than 0',
    'store.validation.requiredField': 'Required field is missing',
    'store.validation.stockNonNegative': 'Stock quantity must be greater than or equal to 0',
    'store.validation.supplyPricePositive': 'Supply price must be greater than 0',
    'common.internalServerError': 'Internal server error',
  },
  uk: {
    'auth.customerCreateFailed': 'Профіль користувача не може бути створений',
    'auth.registrationFailed': 'Реєстрацію не вдалося завершити',
    'auth.emailAlreadyExists': 'Користувач із цією поштою вже існує',
    'auth.emailInvalid': 'Некоректна електронна пошта',
    'auth.emailRequired': "Електронна пошта обов'язкова",
    'auth.invalidCredentials': 'Електронна пошта або пароль неправильні',
    'auth.passwordMinLength': 'Пароль має містити щонайменше 8 символів',
    'auth.passwordRequired': "Пароль обов'язковий",
    'auth.requestBodyInvalid': 'Тіло запиту має бути валідним JSON',
    'auth.requestBodyObjectRequired': "Тіло запиту має бути об'єктом",
    'auth.sessionNotActive': 'Сесія неактивна',
    'store.categoryDeleteConflict': "Категорію неможливо видалити через пов'язані товари",
    'store.categoryNotFound': 'Категорію не знайдено',
    'store.deliveryCreateFailed': 'Поставку не вдалося створити',
    'store.deliveryNotFound': 'Поставку не знайдено',
    'store.forbidden': 'Доступ заборонено',
    'store.orderNotFound': 'Замовлення не знайдено',
    'store.paymentAlreadyExists': 'Оплата для цього замовлення вже існує',
    'store.paymentRegisterFailed': 'Оплату не вдалося зареєструвати',
    'store.productDeleteConflict': "Товар неможливо видалити через пов'язані записи",
    'store.productNotFound': 'Товар не знайдено',
    'store.requestBodyInvalid': 'Тіло запиту має бути валідним JSON',
    'store.requestBodyObjectRequired': "Тіло запиту має бути об'єктом",
    'store.shipmentAlreadyExists': 'Відправлення для цього замовлення вже існує',
    'store.shipmentNotFound': 'Відправлення не знайдено',
    'store.supplierDeleteConflict': "Постачальника неможливо видалити через пов'язані поставки",
    'store.supplierNotFound': 'Постачальника не знайдено',
    'store.unauthorized': 'Потрібна автентифікація',
    'store.validation.dateInvalid': 'Дата має бути у форматі YYYY-MM-DD',
    'store.validation.dateRangeInvalid': 'Дата початку не може бути пізнішою за дату завершення',
    'store.validation.deliveryItemInvalid': "Кожна позиція поставки має бути об'єктом",
    'store.validation.deliveryItemsRequired': 'Поставка має містити щонайменше одну позицію',
    'store.validation.discountRange': 'Знижка має бути в діапазоні від 0 до 100',
    'store.validation.invalidId': 'Ідентифікатор має бути додатним цілим числом',
    'store.validation.nonEmptyString': 'Рядкові поля мають бути непорожніми',
    'store.validation.pricePositive': 'Ціна має бути більшою за 0',
    'store.validation.quantityPositive': 'Кількість має бути більшою за 0',
    'store.validation.requiredField': "Обов'язкове поле відсутнє",
    'store.validation.stockNonNegative': 'Кількість на складі має бути не меншою за 0',
    'store.validation.supplyPricePositive': 'Закупівельна ціна має бути більшою за 0',
    'common.internalServerError': 'Внутрішня помилка сервера',
  },
};

// ===================== HELPERS =====================
function getLocaleFromAcceptLanguage(header: string): BackendLocale {
  const requestedLocale = header.split(',')[0]?.trim().split('-')[0]?.toLowerCase();

  if (requestedLocale === 'uk' || requestedLocale === 'en') {
    return requestedLocale;
  }

  return FALLBACK_LOCALE;
}

// ===================== EXPORTS =====================
export const backendMessages = {
  getLocale(request: NextRequest): BackendLocale {
    return getLocaleFromAcceptLanguage(request.headers.get('accept-language') ?? '');
  },

  translate(key: BackendMessageKey, locale: BackendLocale): string {
    return (
      messages[locale][key] ??
      messages[FALLBACK_LOCALE][key] ??
      messages[FALLBACK_LOCALE]['common.internalServerError'] ??
      'Internal server error'
    );
  },
};
