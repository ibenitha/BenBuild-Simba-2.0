'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ChevronRight, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface CartPageProps {
  params: { locale: string };
}

const FREE_DELIVERY_THRESHOLD = 20000;
const DELIVERY_FEE = 2000;

export default function CartPage({ params: { locale } }: CartPageProps) {
  const t = useTranslations('cart');
  const { items, removeItem, updateQuantity, total, savings } = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const stableItems = hydrated ? items : [];
  const subtotal = hydrated ? total() : 0;
  const totalSavings = hydrated ? savings() : 0;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const orderTotal = subtotal + deliveryFee;
  const progressPct = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
          <Link href={`/${locale}`} className="hover:text-simba-orange transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{t('title')}</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-simba-orange" />
          {t('title')}
          {stableItems.length > 0 && (
            <span className="text-base font-normal text-slate-400">({stableItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
          )}
        </h1>

        {stableItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-orange-50 dark:bg-orange-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-simba-orange/40" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">{t('empty')}</h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">{t('emptyDesc')}</p>
            <Link href={`/${locale}`} className="bg-simba-orange text-white px-8 py-3 rounded-xl font-semibold hover:bg-simba-orange-dark transition-colors inline-flex items-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none">
              {t('shopNow')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {/* Free delivery progress */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-simba-orange" />
                  {deliveryFee === 0 ? (
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      🎉 You&apos;ve unlocked free delivery!
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Add <span className="font-bold text-simba-orange">{formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)}</span> more for free delivery
                    </p>
                  )}
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-simba-orange to-orange-400 rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0</span>
                  <span>{formatPrice(FREE_DELIVERY_THRESHOLD)}</span>
                </div>
              </div>

              {/* Items list */}
              {stableItems.map(item => {
                const itemSaving = item.product.originalPrice
                  ? (item.product.originalPrice - item.product.price) * item.quantity
                  : 0;
                return (
                  <div key={item.product.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex gap-4 shadow-sm group">
                    {/* Image */}
                    <Link href={`/${locale}/products/${item.product.id}`} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/${locale}/products/${item.product.id}`} className="font-semibold text-slate-800 dark:text-slate-100 hover:text-simba-orange transition-colors line-clamp-2 text-sm sm:text-base">
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5">{item.product.category}{item.product.unit ? ` · ${item.product.unit}` : ''}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="flex-shrink-0 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        {/* Stepper */}
                        <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-simba-orange hover:text-white transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold w-9 text-center text-slate-800 dark:text-slate-100">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-simba-orange hover:text-white transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-simba-orange text-base">{formatPrice(item.product.price * item.quantity)}</p>
                          {item.product.originalPrice && (
                            <p className="text-xs text-slate-400 line-through">{formatPrice(item.product.originalPrice * item.quantity)}</p>
                          )}
                          {itemSaving > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Save {formatPrice(itemSaving)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1 space-y-4">
              {/* Savings banner */}
              {totalSavings > 0 && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/30 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold text-green-700 dark:text-green-400 text-sm">You&apos;re saving!</p>
                    <p className="text-green-600 dark:text-green-500 text-xs">{formatPrice(totalSavings)} off on this order</p>
                  </div>
                </div>
              )}

              {/* Summary card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm sticky top-24">
                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal ({stableItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{formatPrice(subtotal)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Savings</span>
                      <span className="font-medium">-{formatPrice(totalSavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {deliveryFee === 0 ? '🎉 Free' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-bold text-base">
                    <span className="text-slate-800 dark:text-slate-100">Total</span>
                    <span className="text-simba-orange text-lg">{formatPrice(orderTotal)}</span>
                  </div>
                </div>

                <Link
                  href={`/${locale}/checkout`}
                  className="mt-5 flex items-center justify-center gap-2 w-full bg-simba-orange hover:bg-simba-orange-dark text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href={`/${locale}`} className="mt-3 block text-center text-sm text-slate-400 hover:text-simba-orange transition-colors">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}