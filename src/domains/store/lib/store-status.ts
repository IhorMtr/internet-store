// ========== Types ==========

export type StoreStatusScope = 'order' | 'shipment' | 'payment';
export type StoreStatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

// ========== Constants ==========

const statusAliases: Record<string, string> = {
  NEW: 'CREATED',
  AWAITING_PAYMENT: 'PENDING',
  SHIPPED: 'IN_TRANSIT',
  SUCCESS: 'PAID',
  COMPLETED: 'PAID',
};

const supportedStatusKeysByScope: Record<StoreStatusScope, readonly string[]> = {
  order: ['CREATED', 'PENDING', 'PROCESSING', 'PAID', 'CANCELLED', 'FAILED', 'UNKNOWN'],
  shipment: ['CREATED', 'PREPARING', 'PROCESSING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'FAILED', 'UNKNOWN'],
  payment: ['CREATED', 'PENDING', 'PROCESSING', 'PAID', 'CANCELLED', 'FAILED', 'UNKNOWN'],
};

// ========== Helpers ==========

function toStatusKey(status: string | null | undefined): string {
  const statusKey = (status?.trim() || 'unknown')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  return statusKey || 'UNKNOWN';
}

export function getStoreStatusLabelKey(status: string | null | undefined, scope: StoreStatusScope): string {
  const normalizedStatusKey = toStatusKey(status);
  const canonicalStatusKey = statusAliases[normalizedStatusKey] ?? normalizedStatusKey;

  if (supportedStatusKeysByScope[scope].includes(canonicalStatusKey)) {
    return `statuses.${scope}.${canonicalStatusKey}`;
  }

  return `statuses.${scope}.UNKNOWN`;
}

export function getStoreStatusTone(status: string | null | undefined): StoreStatusTone {
  const normalized = toStatusKey(status);
  const canonicalStatusKey = statusAliases[normalized] ?? normalized;

  if (['PAID', 'DELIVERED'].includes(canonicalStatusKey)) {
    return 'success';
  }

  if (['CREATED', 'PENDING', 'PROCESSING', 'PREPARING', 'IN_TRANSIT'].includes(canonicalStatusKey)) {
    return 'warning';
  }

  if (['CANCELLED', 'FAILED'].includes(canonicalStatusKey)) {
    return 'danger';
  }

  return 'neutral';
}

export function isStoreOrderPaid(
  paymentStatus: string | null | undefined,
  payment: { status: string | null } | null
): boolean {
  const status = payment?.status ?? paymentStatus;
  const normalized = toStatusKey(status);
  const canonicalStatusKey = statusAliases[normalized] ?? normalized;

  return canonicalStatusKey === 'PAID';
}

export function getEffectiveStoreShippingStatus(
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
