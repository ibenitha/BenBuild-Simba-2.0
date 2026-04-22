'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('product');
  const { addItem, removeItem, updateQuantity, items } = useCartStore();
  const cartItem = items.find(i => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const handleInc = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const handleDec = (e: React.MouseEvent) => {
    e.preventDefault();
    if (qty === 1) removeItem(product.id);
    else updateQuantity(product.id, qty - 1);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <Link href={`/${locale}/products/${product.id}`} className="group block">
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-simba-orange/40 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-700 flex-shrink-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium text-sm bg-red-500 px-3 py-1 rounded-full">
                {t('outOfStock')}
              </span>
            </div>
          )}
          {discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
              -{discount}%
            </div>
          )}
          {qty > 0 && (
            <div className="absolute top-2 right-2 bg-simba-orange text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
              {qty}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-xs text-simba-orange font-medium mb-0.5 truncate">{product.category}</p>
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mb-1 group-hover:text-simba-orange transition-colors leading-snug flex-1">
            {product.name}
          </h3>
          {product.unit && (
            <p className="text-xs text-slate-400 mb-2">{product.unit}</p>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{product.rating}</span>
              {product.reviews && (
                <span className="text-xs text-slate-400">({product.reviews})</span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-end justify-between gap-1 mt-auto">
            <div>
              <p className="font-bold text-simba-orange text-sm leading-tight">{formatPrice(product.price)}</p>
              {product.originalPrice && (
                <p className="text-xs text-slate-400 line-through leading-tight">{formatPrice(product.originalPrice)}</p>
              )}
            </div>

            {/* Quantity stepper or Add button */}
            {qty === 0 ? (
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className="flex items-center gap-1 bg-simba-orange hover:bg-simba-orange-dark text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </button>
            ) : (
              <div
                className="flex items-center gap-1 bg-simba-orange rounded-xl overflow-hidden flex-shrink-0"
                onClick={e => e.preventDefault()}
              >
                <button
                  onClick={handleDec}
                  className="w-7 h-7 flex items-center justify-center text-white hover:bg-simba-orange-dark transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-white font-bold text-sm w-5 text-center">{qty}</span>
                <button
                  onClick={handleInc}
                  className="w-7 h-7 flex items-center justify-center text-white hover:bg-simba-orange-dark transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
