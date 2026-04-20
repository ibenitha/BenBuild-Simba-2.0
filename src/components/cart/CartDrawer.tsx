'use client';

import { useTranslations } from 'next-intl';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { useEffect } from 'react';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  locale: string;
}

export default function CartDrawer({ open, onClose, locale }: CartDrawerProps) {
  const t = useTranslations('cart');
  const { items, removeItem, updateQuantity, total } = useCartStore();

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-2xl transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-simba-green" />
            <h2 className="font-bold text-lg">{t('title')}</h2>
            {items.length > 0 && (
              <span className="bg-simba-green text-white text-xs px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)} {t('items')}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <p className="font-medium text-slate-700 dark:text-slate-300">{t('empty')}</p>
              <p className="text-sm text-slate-400 mt-1">{t('emptyDesc')}</p>
              <button
                onClick={onClose}
                className="mt-4 bg-simba-green text-white px-6 py-2 rounded-xl font-medium hover:bg-simba-green-dark transition-colors"
              >
                {t('shopNow')}
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="flex gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-100 line-clamp-2">{item.product.name}</p>
                  <p className="text-simba-green font-bold text-sm mt-0.5">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-simba-green hover:text-white transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-simba-green hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('subtotal')}</span>
              <span className="font-medium">{formatPrice(total())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('delivery')}</span>
              <span className="font-medium text-simba-green">{total() >= 20000 ? 'Free' : formatPrice(2000)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-slate-200 dark:border-slate-700 pt-3">
              <span>{t('total')}</span>
              <span className="text-simba-green">{formatPrice(total() + (total() >= 20000 ? 0 : 2000))}</span>
            </div>
            <Link
              href={`/${locale}/checkout`}
              onClick={onClose}
              className="block w-full bg-simba-green text-white text-center py-3 rounded-xl font-semibold hover:bg-simba-green-dark transition-colors"
            >
              {t('checkout')}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}