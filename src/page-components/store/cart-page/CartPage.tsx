'use client';

import { Link } from '@/i18n/navigation';
import { formatStoreCurrency } from '@/domains/store/lib/store-format';
import { CartItemRow, CartStockIssues } from '@/domains/store/ui';
import { useCartPage } from '@/page-components/store/cart-page/use-cart-page';
import { Button } from '@/shared/ui';

// ========== Component ==========

export function CartPage() {
  const {
    clearCart,
    decrementItem,
    incrementItem,
    isCheckingStock,
    isEmpty,
    items,
    itemsCount,
    locale,
    removeItem,
    hasStockConflicts,
    stockConflicts,
    subtotal,
    syncCartWithStockConflicts,
    t,
    total,
    updateQuantity,
  } = useCartPage();

  // ========== Render ==========

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
      </div>

      {isEmpty ? (
        <section className="rounded-lg border bg-surface p-6 shadow-soft">
          <p className="text-sm text-muted">{t('empty')}</p>
          <Link href="/catalog" className="mt-4 inline-flex">
            <Button type="button">{t('goToCatalog')}</Button>
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-lg border bg-surface px-4 shadow-soft">
            {hasStockConflicts ? (
              <div className="py-4">
                <CartStockIssues
                  conflicts={stockConflicts}
                  onSyncCart={syncCartWithStockConflicts}
                  isSyncing={isCheckingStock}
                />
              </div>
            ) : null}

            {items.map(item => (
              <CartItemRow
                key={item.productId}
                item={item}
                onDecrement={decrementItem}
                onIncrement={incrementItem}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </section>

          <aside className="h-fit rounded-lg border bg-surface p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-primary">{t('summary.title')}</h2>

            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t('summary.items')}</dt>
                <dd className="font-medium text-primary">{itemsCount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t('summary.subtotal')}</dt>
                <dd className="font-medium text-primary">{formatStoreCurrency(subtotal, locale)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border/70 pt-3">
                <dt className="font-semibold text-primary">{t('summary.total')}</dt>
                <dd className="font-semibold text-primary">{formatStoreCurrency(total, locale)}</dd>
              </div>
            </dl>

            <div className="mt-5 grid gap-2">
              {hasStockConflicts || isCheckingStock ? (
                <Button type="button" className="w-full" disabled>
                  {t('checkout')}
                </Button>
              ) : (
                <Link href="/checkout">
                  <Button type="button" className="w-full">
                    {t('checkout')}
                  </Button>
                </Link>
              )}
              {hasStockConflicts ? <p className="text-xs text-danger">{t('checkoutDisabledStockIssues')}</p> : null}
              <Button type="button" variant="secondary" onClick={clearCart}>
                {t('clear')}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
