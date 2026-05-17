// ========== Types ==========

export type PaymentMethod = 'card' | 'iban' | 'cash_on_delivery';
export type PaymentMethodLabelKey = PaymentMethod | 'unknown';
export type PaymentMethodLabels = Record<PaymentMethodLabelKey, string>;
export type PaymentMethodOption = {
  label: string;
  value: PaymentMethod;
};
export type PaymentMethodTranslate = (key: PaymentMethodLabelKey) => string;

// ========== Constants ==========

export const PAYMENT_METHOD_VALUES = ['card', 'iban', 'cash_on_delivery'] as const satisfies readonly PaymentMethod[];

// ========== Helpers ==========

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && PAYMENT_METHOD_VALUES.includes(value as PaymentMethod);
}

export function createPaymentMethodLabels(t: PaymentMethodTranslate): PaymentMethodLabels {
  return {
    card: t('card'),
    iban: t('iban'),
    cash_on_delivery: t('cash_on_delivery'),
    unknown: t('unknown'),
  };
}

export function createPaymentMethodOptions(labels: PaymentMethodLabels): PaymentMethodOption[] {
  return PAYMENT_METHOD_VALUES.map(value => ({
    label: labels[value],
    value,
  }));
}

export function getPaymentMethodLabel(
  value: string | null | undefined,
  labels: PaymentMethodLabels,
  emptyLabel = '-'
): string {
  if (value === null || value === undefined || value === '') {
    return emptyLabel;
  }

  return isPaymentMethod(value) ? labels[value] : labels.unknown;
}
