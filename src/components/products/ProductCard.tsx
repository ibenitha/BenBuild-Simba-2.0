'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('product');
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/${locale}/products/${product.id}`} className="group block">
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-simba-green/30 transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-700">
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
          {product.originalPrice && (
            <div className="absolute top-2 left-2 bg-simba-orange text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-xs text-simba-green font-medium mb-1">{product.category}</p>
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mb-1 group-hover:text-simba-green transition-colors">
            {product.name}
          </h3>
          {product.unit && (
            <p className="text-xs text-slate-400 mb-2">{product.unit}</p>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">{product.rating}</span>
              {product.reviews && (
                <span className="text-xs text-slate-400">({product.reviews})</span>
              )}
            </div>
          )}

          {/* Price & Add to cart */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-bold text-simba-green text-sm">{formatPrice(product.price)}</p>
              {product.originalPrice && (
                <p className="text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</p>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-simba-green text-white hover:bg-simba-green-dark'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {added ? '✓' : t('addToCart')}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}