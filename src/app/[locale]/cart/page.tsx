'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

interface CartPageProps {
  params: { locale: string };
}

export default function CartPage({ params: { locale } }: CartPageProps) {
  const t = useTranslations('cart');
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const deliveryFee = total() >= 20000 ? 0 : 2000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-simba-green" />
        {t('title')}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">{t('empty')}</h2>
          <p className="text-slate-500 mb-8">{t('emptyDesc')}</p>
          <Link href={`/${locale}`} className="bg-simba-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-simba-green-dark transition-colors inline-flex items-center gap-2">
            {t('shopNow')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.product.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/${locale}/products/${item.product.id}`} className="font-semibold text-slate-800 dark:text-slate-100 hover:text-simba-green transition-colors line-clamp-2">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-slate-500 mt-0.5">{item.product.category}</p>
                  {item.product.unit && <p className="text-xs text-slate-400">{item.product.unit}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-simba-green hover:text-white transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-simba-green hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-simba-green">{formatPrice(item.product.price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 sticky top-24">
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('subtotal')}</span>
                  <span className="font-medium">{formatPrice(total())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('delivery')}</span>
                  <span className={`font-medium ${deliveryFee === 0 ? 'text-simba-green' : ''}`}>
                    {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-slate-400">Add {formatPrice(20000 - total())} more for free delivery</p>
                )}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between font-bold text-base">
                  <span>{t('total')}</span>
                  <span className="text-simba-green">{formatPrice(total() + deliveryFee)}</span>
                </div>
              </div>
              <Link
                href={`/${locale}/checkout`}
                className="mt-6 block w-full bg-simba-green text-white text-center py-3 rounded-xl font-semibold hover:bg-simba-green-dark transition-colors"
              >
                {t('checkout')}
              </Link>
              <Link href={`/${locale}`} className="mt-3 block text-center text-sm text-slate-500 hover:text-simba-green transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}