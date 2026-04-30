import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (!get().items.find(p => p.id === product.id)) {
          set({ items: [...get().items, product] });
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter(p => p.id !== productId) }),
      toggleItem: (product) => {
        if (get().items.find(p => p.id === product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
      isWishlisted: (productId) =>
        !!get().items.find(p => p.id === productId),
      clear: () => set({ items: [] }),
    }),
    { name: 'simba-wishlist' }
  )
);
