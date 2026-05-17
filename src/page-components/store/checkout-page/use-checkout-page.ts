'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { formatStoreCurrency } from '@/domains/store/lib/store-format';
import {
  getCartStockConflicts,
  hasCartStockConflicts,
  readCartStockConflictsFromError,
} from '@/domains/store/lib/store-stock';
import { storeApi } from '@/domains/store/api';
import { useCreateStoreOrderMutation } from '@/domains/store/model/hooks';
import { cartSelectors, useCartStore } from '@/domains/store/model/stores/cart-store';
import { storeQueryKeys } from '@/domains/store/lib/store-query-keys';
import type { CreateStoreOrderInput } from '@/domains/store/model/types';
import type { CheckoutFormValues } from '@/domains/store/ui';
import { apiError } from '@/shared/api/errors';

// ========== Constants ==========

const DEFAULT_SHIPPING_STATUS = 'PREPARING';

// ========== Hook ==========

export function useCheckoutPage() {
  // ========== Translations ==========

  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('Checkout');

  // ========== State ==========

  const items = useCartStore(cartSelectors.items);
  const itemsCount = useCartStore(cartSelectors.itemsCount);
  const total = useCartStore(cartSelectors.total);
  const clearCart = useCartStore(state => state.clearCart);
  const syncWithStockConflicts = useCartStore(state => state.syncWithStockConflicts);

  // ========== State ==========

  const [serverStockConflicts, setServerStockConflicts] = useState<ReturnType<typeof getCartStockConflicts>>([]);

  // ========== Mutations ==========

  const createOrderMutation = useCreateStoreOrderMutation();

  const stockSnapshotQuery = useQuery({
    queryKey: [
      ...storeQueryKeys.products(),
      'checkout-stock-snapshot',
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

  // ========== Derived Values ==========

  const isEmpty = items.length === 0;
  const clientStockConflicts =
    items.length > 0 && stockSnapshotQuery.data ? getCartStockConflicts(items, stockSnapshotQuery.data) : [];
  const stockConflicts = clientStockConflicts.length > 0 ? clientStockConflicts : serverStockConflicts;
  const hasStockConflicts = hasCartStockConflicts(stockConflicts);
  const isCheckingStock = stockSnapshotQuery.isFetching;
  const isSubmitDisabled = isCheckingStock || hasStockConflicts;
  const initialValues: CheckoutFormValues = {
    shippingService: 'nova_poshta',
    shippingAddress: '',
    paymentMethod: 'card',
  };

  const itemNamesById = useMemo(() => new Map(items.map(item => [item.productId, item.name])), [items]);

  // ========== Helpers ==========

  async function refreshStockConflicts() {
    if (items.length === 0) {
      return [];
    }

    const result = await stockSnapshotQuery.refetch();
    const actualProductsById = result.data;

    if (!actualProductsById) {
      return [];
    }

    const conflicts = getCartStockConflicts(items, actualProductsById);

    if (conflicts.length === 0) {
      setServerStockConflicts([]);
    }

    return conflicts;
  }

  // ========== Handlers ==========

  async function submitCheckout(values: CheckoutFormValues) {
    const currentConflicts = await refreshStockConflicts();

    if (currentConflicts.length > 0) {
      setServerStockConflicts([]);
      return;
    }

    const payload: CreateStoreOrderInput = {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentMethod: values.paymentMethod,
      shipment: {
        shippingService: values.shippingService.trim(),
        trackingNumber: null,
        shippingAddress: values.shippingAddress.trim(),
        shippingStatus: DEFAULT_SHIPPING_STATUS,
      },
    };

    try {
      setServerStockConflicts([]);
      const response = await createOrderMutation.mutateAsync(payload);
      const orderId = response.data.order.orderId;

      clearCart();
      router.push(`/orders/${orderId}`);
    } catch (error) {
      const normalizedError = apiError.normalize(error);
      const backendConflicts = readCartStockConflictsFromError(normalizedError, items).map(conflict => ({
        ...conflict,
        productName: itemNamesById.get(conflict.productId) ?? conflict.productName,
      }));

      if (backendConflicts.length > 0) {
        setServerStockConflicts(backendConflicts);
        return;
      }

      throw normalizedError;
    }
  }

  function syncCartWithStockConflicts() {
    if (stockConflicts.length === 0) {
      return;
    }

    syncWithStockConflicts(stockConflicts);
    setServerStockConflicts([]);
  }

  // ========== Return Values ==========

  return {
    t,
    locale,
    items,
    itemsCount,
    total,
    isEmpty,
    initialValues,
    submitCheckout,
    stockConflicts,
    hasStockConflicts,
    isCheckingStock,
    isSubmitDisabled,
    syncCartWithStockConflicts,
    isSubmitting: createOrderMutation.isPending,
    formatStoreCurrency,
  };
}
