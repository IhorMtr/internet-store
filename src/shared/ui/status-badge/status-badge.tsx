import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/cn';

// ========== Types ==========

type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type StatusBadgeProps = {
  label: string;
  status?: string | null;
  tone?: StatusTone;
  className?: string;
};

// ========== Constants ==========

const toneStyles: Record<StatusTone, CSSProperties> = {
  neutral: {
    backgroundColor: 'var(--ds-status-neutral-bg)',
    borderColor: 'var(--ds-status-neutral-border)',
    color: 'var(--ds-status-neutral-text)',
  },
  success: {
    backgroundColor: 'var(--ds-status-success-bg)',
    borderColor: 'var(--ds-status-success-border)',
    color: 'var(--ds-status-success-text)',
  },
  warning: {
    backgroundColor: 'var(--ds-status-warning-bg)',
    borderColor: 'var(--ds-status-warning-border)',
    color: 'var(--ds-status-warning-text)',
  },
  danger: {
    backgroundColor: 'var(--ds-status-danger-bg)',
    borderColor: 'var(--ds-status-danger-border)',
    color: 'var(--ds-status-danger-text)',
  },
  info: {
    backgroundColor: 'var(--ds-status-info-bg)',
    borderColor: 'var(--ds-status-info-border)',
    color: 'var(--ds-status-info-text)',
  },
};

const successStatuses = new Set(['PAID', 'DELIVERED']);
const warningStatuses = new Set(['PENDING', 'PREPARING', 'PROCESSING', 'IN_TRANSIT', 'IN TRANSIT']);
const dangerStatuses = new Set(['CANCELLED', 'CANCELED', 'FAILED']);

// ========== Helpers ==========

function normalizeStatus(status?: string | null) {
  return status?.trim().replaceAll('-', '_').toUpperCase() ?? '';
}

function getToneByStatus(status?: string | null): StatusTone {
  const normalizedStatus = normalizeStatus(status);

  if (successStatuses.has(normalizedStatus)) {
    return 'success';
  }

  if (warningStatuses.has(normalizedStatus)) {
    return 'warning';
  }

  if (dangerStatuses.has(normalizedStatus)) {
    return 'danger';
  }

  return 'neutral';
}

// ========== Component ==========

export function StatusBadge({ label, status, tone, className }: StatusBadgeProps) {
  const resolvedTone = tone ?? getToneByStatus(status);

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
        className
      )}
      style={toneStyles[resolvedTone]}
    >
      {label}
    </span>
  );
}
