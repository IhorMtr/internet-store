// ========== Types ==========

type NumericLike = number | string | null | undefined;

// ========== Helpers ==========

export function toStoreNumber(value: NumericLike): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function getStoreDiscountedPrice(price: NumericLike, discount: NumericLike): number {
  const normalizedPrice = toStoreNumber(price);
  const normalizedDiscount = toStoreNumber(discount);

  return Math.max(0, normalizedPrice * (100 - normalizedDiscount) / 100);
}

export function formatStoreCurrency(value: NumericLike, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 2,
  }).format(toStoreNumber(value));
}

export function formatStoreDate(value: string | null | undefined, locale: string): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}
