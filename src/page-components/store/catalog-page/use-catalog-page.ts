'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useStoreCategoriesQuery, useStoreProductsQuery } from '@/domains/store/model/hooks';
import { cartSelectors, useCartStore } from '@/domains/store/model/stores/cart-store';
import type { StoreProduct } from '@/domains/store/model/types';

// ========== Constants ==========

const ALL_CATEGORIES_VALUE = '__all__';
const EMPTY_CATEGORIES: NonNullable<ReturnType<typeof useStoreCategoriesQuery>['data']>['data']['categories'] = [];
const EMPTY_PRODUCTS: NonNullable<ReturnType<typeof useStoreProductsQuery>['data']>['data']['products'] = [];

// ========== Hook ==========

export function useCatalogPage() {
  // ========== Hooks ==========

  const t = useTranslations('Catalog');

  // ========== State ==========

  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORIES_VALUE);

  // ========== Store ==========

  const cartItems = useCartStore(cartSelectors.items);
  const cartItemsCount = useCartStore(cartSelectors.itemsCount);
  const addItem = useCartStore(state => state.addItem);

  // ========== Queries ==========

  const categoriesQuery = useStoreCategoriesQuery();
  const productsQuery = useStoreProductsQuery({
    search: search.trim() || null,
    categoryId: selectedCategoryId === ALL_CATEGORIES_VALUE ? null : Number(selectedCategoryId),
  });

  // ========== Derived Data ==========

  const categories = categoriesQuery.data?.data.categories ?? EMPTY_CATEGORIES;
  const products = productsQuery.data?.data.products ?? EMPTY_PRODUCTS;
  const categoryNameById = useMemo(
    () => new Map(categories.map(category => [category.categoryId, category.categoryName])),
    [categories]
  );
  const cartQuantityByProductId = useMemo(
    () => new Map(cartItems.map(item => [item.productId, item.quantity])),
    [cartItems]
  );
  const categoryOptions = [
    { label: t('filters.allCategories'), value: ALL_CATEGORIES_VALUE },
    ...categories.map(category => ({
      label: category.categoryName,
      value: String(category.categoryId),
    })),
  ];

  // ========== Handlers ==========

  function addProductToCart(product: StoreProduct) {
    addItem(product, 1);
  }

  // ========== Return ==========

  return {
    t,
    products,
    categories,
    categoryNameById,
    categoryOptions,
    cartItemsCount,
    cartQuantityByProductId,
    search,
    selectedCategoryId,
    setSearch,
    setSelectedCategoryId,
    addProductToCart,
    isLoading: categoriesQuery.isLoading || productsQuery.isLoading,
  };
}
