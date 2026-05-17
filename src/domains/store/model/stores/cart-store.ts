'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getStoreDiscountedPrice } from '@/domains/store/lib/store-format';
import type { CartStockConflict } from '@/domains/store/lib/store-stock';
import type { StoreCartItem, StoreProduct } from '@/domains/store/model/types';

// ========== Types ==========

type CartState = {
  items: StoreCartItem[];
  addItem(product: StoreProduct, quantity?: number): void;
  removeItem(productId: number): void;
  updateQuantity(productId: number, quantity: number): void;
  incrementItem(productId: number): void;
  decrementItem(productId: number): void;
  syncWithStockConflicts(conflicts: CartStockConflict[]): void;
  clearCart(): void;
};

// ========== Constants ==========

const CART_STORAGE_KEY = 'shopcore-cart';

// ========== Helpers ==========

function clampQuantity(quantity: number, stockQuantity: number): number {
  if (stockQuantity <= 0) {
    return 0;
  }

  return Math.max(1, Math.min(stockQuantity, Math.floor(quantity)));
}

function toCartItem(product: StoreProduct, quantity: number): StoreCartItem | null {
  const normalizedQuantity = clampQuantity(quantity, product.stockQuantity);

  if (normalizedQuantity <= 0) {
    return null;
  }

  return {
    productId: product.productId,
    name: product.name,
    imageUrl: product.imageUrl,
    price: product.price,
    discount: product.discount,
    stockQuantity: product.stockQuantity,
    quantity: normalizedQuantity,
  };
}

function getItemTotal(item: StoreCartItem): number {
  return getStoreDiscountedPrice(item.price, item.discount) * item.quantity;
}

// ========== Store ==========

export const useCartStore = create<CartState>()(
  persist(
    set => ({
      items: [],

      addItem(product, quantity = 1) {
        set(state => {
          const cartItem = toCartItem(product, quantity);

          if (!cartItem) {
            return state;
          }

          const existingItem = state.items.find(item => item.productId === product.productId);

          if (!existingItem) {
            return {
              items: [...state.items, cartItem],
            };
          }

          return {
            items: state.items.map(item =>
              item.productId === product.productId
                ? {
                    ...item,
                    name: product.name,
                    imageUrl: product.imageUrl,
                    price: product.price,
                    discount: product.discount,
                    stockQuantity: product.stockQuantity,
                    quantity: clampQuantity(item.quantity + quantity, product.stockQuantity),
                  }
                : item
            ),
          };
        });
      },

      removeItem(productId) {
        set(state => ({
          items: state.items.filter(item => item.productId !== productId),
        }));
      },

      updateQuantity(productId, quantity) {
        set(state => ({
          items: state.items
            .map(item =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: clampQuantity(quantity, item.stockQuantity),
                  }
                : item
            )
            .filter(item => item.quantity > 0),
        }));
      },

      incrementItem(productId) {
        set(state => ({
          items: state.items.map(item =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: clampQuantity(item.quantity + 1, item.stockQuantity),
                }
              : item
          ),
        }));
      },

      decrementItem(productId) {
        set(state => ({
          items: state.items
            .map(item =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: clampQuantity(item.quantity - 1, item.stockQuantity),
                  }
                : item
            )
            .filter(item => item.quantity > 0),
        }));
      },

      syncWithStockConflicts(conflicts) {
        const conflictsByProductId = new Map(conflicts.map(conflict => [conflict.productId, conflict]));

        set(state => ({
          items: state.items
            .map(item => {
              const conflict = conflictsByProductId.get(item.productId);

              if (!conflict) {
                return item;
              }

              if (conflict.availableQuantity <= 0) {
                return null;
              }

              return {
                ...item,
                quantity: clampQuantity(item.quantity, conflict.availableQuantity),
                stockQuantity: conflict.availableQuantity,
              };
            })
            .filter((item): item is StoreCartItem => Boolean(item)),
        }));
      },

      clearCart() {
        set({ items: [] });
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ items: state.items }),
    }
  )
);

// ========== Selectors ==========

export const cartSelectors = {
  items(state: CartState): StoreCartItem[] {
    return state.items;
  },

  itemsCount(state: CartState): number {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  },

  subtotal(state: CartState): number {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  total(state: CartState): number {
    return state.items.reduce((total, item) => total + getItemTotal(item), 0);
  },
};
