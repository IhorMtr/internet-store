type NumericLike = number | string | null | undefined;

export function toNumber(value: NumericLike): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function formatCurrency(value: NumericLike, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

export function formatDate(value: string | null | undefined, locale: string): string {
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

export function formatDateTime(value: string | null | undefined, locale: string): string {
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function normalizeStatus(value: string | null | undefined): string {
  return value?.trim() ? value : 'unknown';
}

export type AdminStatusScope = 'order' | 'shipment' | 'payment';

const statusAliases: Record<string, string> = {
  NEW: 'CREATED',
  AWAITING_PAYMENT: 'PENDING',
  SHIPPED: 'IN_TRANSIT',
  SUCCESS: 'COMPLETED',
  ERROR: 'FAILED',
  APPROVED: 'PROCESSING',
};

const supportedStatusKeysByScope: Record<AdminStatusScope, readonly string[]> = {
  order: [
    'CREATED',
    'PENDING',
    'PROCESSING',
    'IN_TRANSIT',
    'COMPLETED',
    'PAID',
    'DELIVERED',
    'CANCELLED',
    'FAILED',
    'RETURNED',
    'UNKNOWN',
  ],
  shipment: [
    'CREATED',
    'PREPARING',
    'PROCESSING',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
    'FAILED',
    'RETURNED',
    'UNKNOWN',
  ],
  payment: ['CREATED', 'PENDING', 'PROCESSING', 'PAID', 'CANCELLED', 'FAILED', 'UNKNOWN'],
};

function toStatusKey(status: string | null | undefined): string {
  const statusKey = normalizeStatus(status)
    .trim()
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  return statusKey || 'UNKNOWN';
}

export function getAdminStatusLabelKey(status: string | null | undefined, scope: AdminStatusScope): string {
  const normalizedStatusKey = toStatusKey(status);
  const canonicalStatusKey = statusAliases[normalizedStatusKey] ?? normalizedStatusKey;

  if (supportedStatusKeysByScope[scope].includes(canonicalStatusKey)) {
    return `statuses.${scope}.${canonicalStatusKey}`;
  }

  return `statuses.${scope}.UNKNOWN`;
}

export function toStatusTone(status: string | null | undefined): 'neutral' | 'success' | 'warning' | 'danger' | 'info' {
  const normalized = normalizeStatus(status).toLowerCase();

  if (['paid', 'completed', 'delivered', 'shipped', 'success'].includes(normalized)) {
    return 'success';
  }

  if (['processing', 'pending', 'awaiting_payment', 'new', 'preparing', 'in_transit'].includes(normalized)) {
    return 'warning';
  }

  if (['cancelled', 'failed', 'error', 'returned'].includes(normalized)) {
    return 'danger';
  }

  if (['approved'].includes(normalized)) {
    return 'info';
  }

  return 'neutral';
}

export function getEffectiveAdminShippingStatus(
  orderStatus: string | null | undefined,
  shippingStatus: string | null | undefined
): string | null {
  const normalizedOrderStatus = toStatusKey(orderStatus);
  const canonicalOrderStatus = statusAliases[normalizedOrderStatus] ?? normalizedOrderStatus;

  if (canonicalOrderStatus === 'CANCELLED') {
    return 'CANCELLED';
  }

  return shippingStatus ?? null;
}
