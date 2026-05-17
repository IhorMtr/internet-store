'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useStoreCategoriesQuery, useStoreProductQuery } from '@/domains/store/model/hooks';
import { cartSelectors, useCartStore } from '@/domains/store/model/stores/cart-store';

// ========== Types ==========

type UseProductDetailsPageArgs = {
  productId: number;
};

// ========== Constants ==========

const EMPTY_CATEGORIES: NonNullable<ReturnType<typeof useStoreCategoriesQuery>['data']>['data']['categories'] = [];

// ========== Hook ==========

export function useProductDetailsPage({ productId }: UseProductDetailsPageArgs) {
  // ========== Hooks ==========

  const locale = useLocale();
  const t = useTranslations('ProductDetails');

  // ========== State ==========

  const [quantity, setQuantity] = useState(1);

  // ========== Store ==========

  const cartItems = useCartStore(cartSelectors.items);
  const addItem = useCartStore(state => state.addItem);

  // ========== Queries ==========

  const productQuery = useStoreProductQuery(productId);
  const categoriesQuery = useStoreCategoriesQuery();

  // ========== Derived Data ==========

  const product = productQuery.data?.data.product ?? null;
  const categories = categoriesQuery.data?.data.categories ?? EMPTY_CATEGORIES;
  const categoryNameById = useMemo(
    () => new Map(categories.map(category => [category.categoryId, category.categoryName])),
    [categories]
  );
  const categoryName = product ? categoryNameById.get(product.categoryId) : null;
  const inCartQuantity = cartItems.find(item => item.productId === productId)?.quantity ?? 0;
  const maxQuantity = Math.max(1, product?.stockQuantity ?? 1);
  const normalizedQuantity = Math.max(1, Math.min(maxQuantity, quantity));
  const isOutOfStock = !product || product.stockQuantity <= 0;

  // ========== Handlers ==========

  function updateQuantity(value: number) {
    setQuantity(Math.max(1, Math.min(maxQuantity, Math.floor(value))));
  }

  function addProductToCart() {
    if (!product) {
      return;
    }

    addItem(product, normalizedQuantity);
  }

  // ========== Return ==========

  return {
    t,
    locale,
    product,
    categoryName,
    inCartQuantity,
    quantity: normalizedQuantity,
    maxQuantity,
    updateQuantity,
    addProductToCart,
    isLoading: productQuery.isLoading,
    isOutOfStock,
  };
}
