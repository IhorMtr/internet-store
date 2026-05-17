'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { storeApi } from '@/domains/store/api';
import { getCartStockConflicts, hasCartStockConflicts } from '@/domains/store/lib/store-stock';
import { cartSelectors, useCartStore } from '@/domains/store/model/stores/cart-store';
import { storeQueryKeys } from '@/domains/store/lib/store-query-keys';
import { apiError } from '@/shared/api/errors';

// ========== Hook ==========

export function useCartPage() {
  // ========== Hooks ==========

  const locale = useLocale();
  const t = useTranslations('Cart');

  // ========== Store ==========

  const items = useCartStore(cartSelectors.items);
  const itemsCount = useCartStore(cartSelectors.itemsCount);
  const subtotal = useCartStore(cartSelectors.subtotal);
  const total = useCartStore(cartSelectors.total);
  const clearCart = useCartStore(state => state.clearCart);
  const decrementItem = useCartStore(state => state.decrementItem);
  const incrementItem = useCartStore(state => state.incrementItem);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const syncWithStockConflicts = useCartStore(state => state.syncWithStockConflicts);

  const stockSnapshotQuery = useQuery({
    queryKey: [
      ...storeQueryKeys.products(),
      'cart-stock-snapshot',
      items.map(item => `${item.productId}:${item.quantity}`),
    ],
    queryFn: async () => {
      const entries = await Promise.all(
        items.map(async item => {
          try {
            const response = await storeApi.getProduct(item.productId);

            return [item.productId, response.data.product] as const;
          } catch (error) {
            const normalizedError = apiError.normalize(error);

            if (normalizedError.status === 404) {
              return [item.productId, null] as const;
            }

            throw normalizedError;
          }
        })
      );

      return new Map(entries);
    },
    enabled: items.length > 0,
    retry: false,
  });

  // ========== Derived Data ==========

  const isEmpty = items.length === 0;
  const stockConflicts =
    items.length > 0 && stockSnapshotQuery.data ? getCartStockConflicts(items, stockSnapshotQuery.data) : [];
  const hasStockConflicts = hasCartStockConflicts(stockConflicts);
  const isCheckingStock = stockSnapshotQuery.isFetching;

  function syncCartWithStockConflicts() {
    if (stockConflicts.length === 0) {
      return;
    }

    syncWithStockConflicts(stockConflicts);
  }

  // ========== Return ==========

  return {
    t,
    locale,
    items,
    itemsCount,
    subtotal,
    total,
    isEmpty,
    stockConflicts,
    hasStockConflicts,
    isCheckingStock,
    syncCartWithStockConflicts,
    clearCart,
    decrementItem,
    incrementItem,
    removeItem,
    updateQuantity,
  };
}
