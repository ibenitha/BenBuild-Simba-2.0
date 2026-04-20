'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(s => s.addItem);

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2">
        <button
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm hover:bg-simba-green hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-bold text-lg w-8 text-center">{quantity}</span>
        <button
          onClick={() => setQuantity(q => q + 1)}
          className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm hover:bg-simba-green hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        disabled={!product.inStock}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base transition-all active:scale-95 ${
          added
            ? 'bg-green-500 text-white'
            : 'bg-simba-green text-white hover:bg-simba-green-dark'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <ShoppingCart className="w-5 h-5" />
        {added ? '✓ Added to Cart!' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
}