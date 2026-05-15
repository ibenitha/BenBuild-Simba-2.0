'use client';

import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function WishlistPage({ params: { locale } }: { params: { locale: string } }) {
  const { items, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">My Wishlist</h1>
        <div className="bg-pink-50 dark:bg-pink-950/30 text-pink-500 text-xs font-bold px-3 py-1.5 rounded-full">
          {items.length} items saved
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Your wishlist is empty</h2>
          <p className="text-sm text-slate-400 mt-1 mb-8">Save items you like to find them easily later.</p>
          <Link
            href={`/${locale}`}
            className="bg-simba-orange text-white px-8 py-3 rounded-2xl font-bold hover:bg-simba-orange-dark transition-colors inline-block"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((product) => (
            <div key={product.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-pink-200 dark:hover:border-pink-900/30 transition-all group">
              <Link href={`/${locale}/products/${product.id}`} className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700">
                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-110" />
              </Link>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                  <p className="font-bold text-simba-orange mt-2">{formatPrice(product.price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { addToCart(product); removeItem(product.id); }}
                    className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-simba-orange hover:border-simba-orange hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Move to Cart
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
