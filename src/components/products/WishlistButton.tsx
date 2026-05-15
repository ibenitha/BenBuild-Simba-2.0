'use client';

import { useWishlistStore } from '@/store/wishlist';
import { Product } from '@/types';
import { Heart } from 'lucide-react';

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export default function WishlistButton({ product, className = "" }: WishlistButtonProps) {
  const { addItem, removeItem, hasItem } = useWishlistStore();
  const active = hasItem(product.id);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (active) removeItem(product.id);
    else addItem(product);
  };

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-full transition-all ${
        active
          ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 dark:shadow-none'
          : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-pink-500 backdrop-blur-sm'
      } ${className}`}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
    </button>
  );
}
