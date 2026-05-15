'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  hasItem: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        if (!items.find(i => i.id === product.id)) {
          set({ items: [...items, product] });
        }
      },
      removeItem: (productId) => set({ items: get().items.filter(i => i.id !== productId) }),
      clearWishlist: () => set({ items: [] }),
      hasItem: (productId) => get().items.some(i => i.id === productId),
    }),
    { name: 'simba-wishlist' }
  )
);
