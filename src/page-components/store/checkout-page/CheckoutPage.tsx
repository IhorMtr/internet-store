'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getStockConflictsMapByProductId } from '@/domains/store/lib/store-stock';
import { getStoreDiscountedPrice } from '@/domains/store/lib/store-format';
import { CartStockIssues, CheckoutForm } from '@/domains/store/ui';
import { useCheckoutPage } from '@/page-components/store/checkout-page/use-checkout-page';
import { Button } from '@/shared/ui';
import { ProductImage } from '@/shared/ui/product-image/ProductImage';

// ========== Component ==========

export function CheckoutPage() {
  const {
    formatStoreCurrency,
    hasStockConflicts,
    initialValues,
    isCheckingStock,
    isEmpty,
    isSubmitDisabled,
    isSubmitting,
    items,
    itemsCount,
    locale,
    stockConflicts,
    submitCheckout,
    syncCartWithStockConflicts,
    t,
    total,
  } = useCheckoutPage();
  const storeT = useTranslations('Store');

  const conflictsByProductId = getStockConflictsMapByProductId(stockConflicts);

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
          <section className="rounded-lg border bg-surface p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-primary">{t('form.title')}</h2>
            <div className="mt-4">
              <CheckoutForm
                initialValues={initialValues}
                isSubmitting={isSubmitting || isCheckingStock}
                isSubmitDisabled={isSubmitDisabled}
                onSubmit={submitCheckout}
              />
            </div>

            {hasStockConflicts ? (
              <div className="mt-4">
                <CartStockIssues
                  conflicts={stockConflicts}
                  onSyncCart={syncCartWithStockConflicts}
                  isSyncing={isCheckingStock}
                  showBackToCart
                />
              </div>
            ) : null}
          </section>

          <aside className="h-fit rounded-lg border bg-surface p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-primary">{t('summary.title')}</h2>
            <ul className="mt-4 grid gap-3 text-sm">
              {items.map(item => {
                const conflict = conflictsByProductId.get(item.productId);

                return (
                  <li
                    key={item.productId}
                    className={`rounded-md px-2 py-1 ${
                      conflict ? 'border border-danger/30 bg-danger/5' : 'border border-transparent'
                    }`}
                  >
                    <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2">
                      <ProductImage
                        src={item.imageUrl}
                        alt={item.name}
                        fallbackLabel={t('summary.noImage')}
                        className="aspect-square h-11 w-11"
                        sizes="44px"
                      />

                      <span className="min-w-0 text-muted">
                        {item.name} x {item.quantity}
                      </span>

                      <span className="font-medium text-primary">
                        {formatStoreCurrency(
                          getStoreDiscountedPrice(item.price, item.discount) * item.quantity,
                          locale
                        )}
                      </span>
                    </div>

                    {conflict ? (
                      <p className="mt-1 text-xs text-danger">
                        {storeT('stockIssues.available', { available: conflict.availableQuantity })}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex justify-between border-t border-border/70 pt-3 text-sm">
              <span className="text-muted">{t('summary.items')}</span>
              <span className="font-medium text-primary">{itemsCount}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold">
              <span>{t('summary.total')}</span>
              <span>{formatStoreCurrency(total, locale)}</span>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
