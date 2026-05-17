'use client';

import { ShoppingCart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { formatStoreCurrency, getStoreDiscountedPrice } from '@/domains/store/lib/store-format';
import { useProductDetailsPage } from '@/page-components/store/product-details-page/use-product-details-page';
import { Button, Input } from '@/shared/ui';
import { ProductImage } from '@/shared/ui/product-image/ProductImage';

// ========== Types ==========

type ProductDetailsPageProps = {
  productId: number;
};

// ========== Component ==========

export function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const {
    addProductToCart,
    categoryName,
    inCartQuantity,
    isLoading,
    isOutOfStock,
    locale,
    maxQuantity,
    product,
    quantity,
    t,
    updateQuantity,
  } = useProductDetailsPage({ productId });

  // ========== Render ==========

  if (isLoading) {
    return (
      <section className="rounded-lg border bg-surface p-6 text-sm text-muted shadow-soft">{t('loading')}</section>
    );
  }

  if (!product) {
    return (
      <section className="rounded-lg border bg-surface p-6 text-sm text-muted shadow-soft">{t('notFound')}</section>
    );
  }

  const discountedPrice = getStoreDiscountedPrice(product.price, product.discount);

  return (
    <section className="space-y-6">
      <Link href="/catalog" className="text-sm font-medium text-accent hover:underline">
        {t('backToCatalog')}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border bg-surface p-5 shadow-soft">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            fallbackLabel={t('noImage')}
            className="mb-4 aspect-16/10 w-full"
            sizes="(max-width: 1024px) 100vw, 720px"
          />

          <p className="text-xs font-semibold uppercase text-muted">{categoryName ?? t('unknownCategory')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-primary">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="text-2xl font-semibold text-primary">{formatStoreCurrency(discountedPrice, locale)}</p>
            {product.discount > 0 ? (
              <>
                <p className="text-sm text-muted line-through">{formatStoreCurrency(product.price, locale)}</p>
                <span className="rounded-full bg-danger/10 px-2 py-1 text-xs font-semibold text-danger">
                  {t('discount', { discount: product.discount })}
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-4 text-sm leading-6 text-muted">{product.description ?? t('noDescription')}</p>
        </section>

        <aside className="h-fit rounded-lg border bg-surface p-5 shadow-soft">
          <p className="text-sm text-muted">{t('stock', { stock: product.stockQuantity })}</p>

          {inCartQuantity > 0 ? (
            <p className="mt-2 text-sm font-medium text-accent">{t('inCart', { quantity: inCartQuantity })}</p>
          ) : null}

          <label className="mt-4 grid gap-1 text-sm">
            <span>{t('quantity')}</span>
            <Input
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              disabled={isOutOfStock}
              onChange={event => updateQuantity(Number(event.target.value))}
            />
          </label>

          <Button type="button" className="mt-4 w-full" onClick={addProductToCart} disabled={isOutOfStock}>
            <ShoppingCart aria-hidden="true" className="mr-2 h-4 w-4" />
            {isOutOfStock ? t('outOfStock') : t('addToCart')}
          </Button>
        </aside>
      </div>
    </section>
  );
}
