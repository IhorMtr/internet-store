'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { CartStockConflict } from '@/domains/store/lib/store-stock';
import { Button } from '@/shared/ui/button';

// ========== Types ==========

type CartStockIssuesProps = {
  conflicts: CartStockConflict[];
  onSyncCart?: () => void;
  isSyncing?: boolean;
  showBackToCart?: boolean;
};

// ========== Component ==========

export function CartStockIssues({
  conflicts,
  onSyncCart,
  isSyncing = false,
  showBackToCart = false,
}: CartStockIssuesProps) {
  const t = useTranslations('Store.stockIssues');

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-danger/40 bg-danger/5 p-4 shadow-soft">
      <h2 className="text-base font-semibold text-danger">{t('title')}</h2>

      <ul className="mt-3 grid gap-2 text-sm text-primary">
        {conflicts.map(conflict => (
          <li key={conflict.productId} className="rounded-md border border-danger/20 bg-surface px-3 py-2">
            <p className="font-medium">{conflict.productName}</p>
            <p className="mt-1 text-muted">{t('inCart', { requested: conflict.requestedQuantity })}</p>
            <p className="text-muted">{t('available', { available: conflict.availableQuantity })}</p>
            {conflict.reason === 'missing' || conflict.reason === 'outOfStock' ? (
              <p className="mt-1 text-danger">{t('productUnavailable')}</p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        {onSyncCart ? (
          <Button type="button" variant="secondary" onClick={onSyncCart} disabled={isSyncing}>
            {t('syncCart')}
          </Button>
        ) : null}

        {showBackToCart ? (
          <Link href="/cart" className="inline-flex">
            <Button type="button" variant="ghost">
              {t('backToCart')}
            </Button>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
