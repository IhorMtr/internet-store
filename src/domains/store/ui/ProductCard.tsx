'use client';

import { ShoppingCart } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatStoreCurrency, getStoreDiscountedPrice } from '@/domains/store/lib/store-format';
import type { StoreProduct } from '@/domains/store/model/types';
import { Button } from '@/shared/ui/button';
import { ProductImage } from '@/shared/ui/product-image/ProductImage';

// ========== Types ==========

type ProductCardProps = {
  categoryName?: string;
  inCartQuantity?: number;
  product: StoreProduct;
  onAddToCart: (product: StoreProduct) => void;
};

// ========== Helpers ==========

function getShortDescription(description: string | null): string | null {
  if (!description) {
    return null;
  }

  return description.length > 120 ? `${description.slice(0, 117)}...` : description;
}

// ========== Component ==========

export function ProductCard({ categoryName, inCartQuantity = 0, product, onAddToCart }: ProductCardProps) {
  // ========== Hooks ==========

  const locale = useLocale();
  const t = useTranslations('Catalog');

  // ========== Derived Data ==========

  const isOutOfStock = product.stockQuantity <= 0;
  const discountedPrice = getStoreDiscountedPrice(product.price, product.discount);
  const hasDiscount = product.discount > 0;
  const description = getShortDescription(product.description);

  // ========== Render ==========

  return (
    <article className="grid h-full gap-4 rounded-lg border bg-surface p-4 shadow-soft">
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        fallbackLabel={t('card.noImage')}
        className="aspect-4/3 w-full"
        sizes="(max-width: 768px) 100vw, 320px"
      />

      <div className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-muted">{categoryName ?? t('card.unknownCategory')}</p>
            <h2 className="mt-1 text-lg font-semibold text-primary">{product.name}</h2>
          </div>

          {hasDiscount ? (
            <span className="shrink-0 rounded-full bg-danger/10 px-2 py-1 text-xs font-semibold text-danger">
              {t('card.discount', { discount: product.discount })}
            </span>
          ) : null}
        </div>

        {description ? <p className="text-sm leading-6 text-muted">{description}</p> : null}
      </div>

      <div className="mt-auto grid gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xl font-semibold text-primary">{formatStoreCurrency(discountedPrice, locale)}</p>
            {hasDiscount ? (
              <p className="text-sm text-muted line-through">{formatStoreCurrency(product.price, locale)}</p>
            ) : null}
          </div>
          <p className="text-sm text-muted">{t('card.stock', { stock: product.stockQuantity })}</p>
        </div>

        {inCartQuantity > 0 ? (
          <p className="text-sm font-medium text-accent">{t('card.inCart', { quantity: inCartQuantity })}</p>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href={`/catalog/${product.productId}`}
            className="ds-transition inline-flex items-center justify-center rounded-md border bg-surface px-4 py-2 text-body font-medium text-primary shadow-soft outline-none hover:bg-surface-raised focus-visible:shadow-focus"
          >
            {t('card.details')}
          </Link>

          <Button type="button" onClick={() => onAddToCart(product)} disabled={isOutOfStock}>
            <ShoppingCart aria-hidden="true" className="mr-2 h-4 w-4" />
            {isOutOfStock ? t('card.outOfStock') : t('card.addToCart')}
          </Button>
        </div>
      </div>
    </article>
  );
}
