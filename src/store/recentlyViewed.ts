import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface RecentlyViewedStore {
  items: Product[];
  addItem: (product: Product) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const filtered = get().items.filter(p => p.id !== product.id);
        set({ items: [product, ...filtered].slice(0, 8) });
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'simba-recently-viewed' }
  )
);