'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { useBranchStore } from '@/store/branch';
import { useOperationsStore } from '@/store/operations';
import { formatPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ProductCardProps {
  product: Product;
  locale: string;
}

// Known category slugs that have translations
const KNOWN_CATEGORY_SLUGS = new Set([
  'all',
  'cosmetics-and-personal-care',
  'sports-and-wellness',
  'baby-products',
  'kitchenware-and-electronics',
  'food-products',
  'alcoholic-drinks',
  'general',
  'cleaning-and-sanitary',
  'kitchen-storage',
  'pet-care',
]);

export default function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('product');
  const tCat = useTranslations('categories');
  const { addItem, removeItem, updateQuantity, items } = useCartStore();
  const { selectedBranchId } = useBranchStore();
  const { fetchStock, getBranchStock, stockByBranch } = useOperationsStore();
  
  const cartItem = items.find(i => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  // Use local state or store for stock
  const branchStock = getBranchStock(selectedBranchId, product.id);
  const isOutOfStock = branchStock === 0;
  const isLowStock = branchStock > 0 && branchStock < 5;

  useEffect(() => {
    // Ensure stock is loaded for this branch
    if (!stockByBranch[selectedBranchId]) {
      fetchStock(selectedBranchId);
    }
  }, [selectedBranchId, fetchStock, stockByBranch]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOutOfStock) addItem(product);
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300 flex flex-col h-full">

        {/* Image — tall ratio like the screenshot */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-700 flex-shrink-0" style={{ aspectRatio: '4/3' }}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-red-500 font-black text-xs uppercase tracking-widest border border-red-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                {t('outOfStock')}
              </span>
            </div>
          )}

          {/* Low stock badge */}
          {isLowStock && !isOutOfStock && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow uppercase animate-pulse">
              🔥 {t('onlyLeft', { qty: branchStock })}
            </div>
          )}

          {/* Discount badge */}
          {discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
              -{discount}%
            </div>
          )}

          {/* Cart qty bubble */}
          {qty > 0 && !isOutOfStock && (
            <div className="absolute top-2 right-2 bg-simba-orange text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-10">
              {qty}
            </div>
          )}

          {/* Quick-add "+" button on hover when not in cart */}
          {qty === 0 && !isOutOfStock && (
            <button
              onClick={handleAdd}
              className="absolute bottom-3 right-3 w-10 h-10 bg-simba-orange hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Add to cart"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          <p className="text-xs text-simba-orange font-semibold mb-1 truncate">
            {KNOWN_CATEGORY_SLUGS.has(product.categorySlug)
              ? tCat(product.categorySlug as any)
              : product.category}
          </p>

          {/* Name */}
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mb-1 leading-snug flex-1">
            {product.name}
          </h3>

          {/* Unit */}
          {product.unit && (
            <p className="text-xs text-slate-400 mb-3">{product.unit}</p>
          )}

          {/* Price + stepper row */}
          <div className="flex items-end justify-between gap-2 mt-auto">
            {/* Price block */}
            <div>
              <p className="font-black text-simba-orange text-lg leading-tight">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice ? (
                <p className="text-xs text-slate-400 line-through leading-tight">{formatPrice(product.originalPrice)}</p>
              ) : (
                <p className="text-[10px] text-slate-400 leading-tight uppercase tracking-wide">RWF</p>
              )}
            </div>

            {/* Add / Stepper */}
            {qty === 0 ? (
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className="flex items-center gap-1.5 bg-simba-orange hover:bg-orange-600 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-shrink-0 min-h-[44px]"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {t('add')}
              </button>
            ) : (
              <div
                className="flex items-center bg-simba-orange rounded-xl overflow-hidden flex-shrink-0 shadow-sm"
                onClick={e => e.preventDefault()}
              >
                <button
                  onClick={handleDec}
                  className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-white font-bold text-sm w-6 text-center">{qty}</span>
                <button
                  onClick={handleInc}
                  className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
