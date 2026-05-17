'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { formatStoreCurrency, getStoreDiscountedPrice } from '@/domains/store/lib/store-format';
import type { StoreCartItem } from '@/domains/store/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ProductImage } from '@/shared/ui/product-image/ProductImage';

// ========== Types ==========

type CartItemRowProps = {
  item: StoreCartItem;
  onDecrement: (productId: number) => void;
  onIncrement: (productId: number) => void;
  onRemove: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
};

// ========== Component ==========

export function CartItemRow({ item, onDecrement, onIncrement, onRemove, onUpdateQuantity }: CartItemRowProps) {
  // ========== Hooks ==========

  const locale = useLocale();
  const t = useTranslations('Cart');

  // ========== Derived Data ==========

  const unitPrice = getStoreDiscountedPrice(item.price, item.discount);
  const totalPrice = unitPrice * item.quantity;
  const isAtMin = item.quantity <= 1;
  const isAtMax = item.quantity >= item.stockQuantity;

  // ========== Handlers ==========

  function handleQuantityChange(event: React.ChangeEvent<HTMLInputElement>) {
    onUpdateQuantity(item.productId, Number(event.target.value));
  }

  // ========== Render ==========

  return (
    <div className="grid gap-4 border-b border-border/70 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
      <div className="grid min-w-0 gap-3 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
          fallbackLabel={t('item.noImage')}
          className="aspect-square h-16 w-16"
          sizes="64px"
        />

        <div className="min-w-0">
          <h2 className="text-base font-semibold text-primary">{item.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {formatStoreCurrency(unitPrice, locale)} · {t('item.stock', { stock: item.stockQuantity })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label={t('item.decrement')}
          onClick={() => onDecrement(item.productId)}
          disabled={isAtMin}
        >
          <Minus aria-hidden="true" className="h-4 w-4" />
        </Button>

        <Input
          aria-label={t('item.quantity')}
          className="w-20 text-center"
          type="number"
          min={1}
          max={item.stockQuantity}
          value={item.quantity}
          onChange={handleQuantityChange}
        />

        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label={t('item.increment')}
          onClick={() => onIncrement(item.productId)}
          disabled={isAtMax}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 md:min-w-44 md:justify-end">
        <p className="font-semibold text-primary">{formatStoreCurrency(totalPrice, locale)}</p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label={t('item.remove')}
          onClick={() => onRemove(item.productId)}
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
