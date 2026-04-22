'use client';

import { useEffect } from 'react';
import { Product } from '@/types';
import { useRecentlyViewedStore } from '@/store/recentlyViewed';

export default function ViewTracker({ product }: { product: Product }) {
  const addItem = useRecentlyViewedStore(s => s.addItem);
  useEffect(() => { addItem(product); }, [product.id]); // eslint-disable-line
  return null;
}
