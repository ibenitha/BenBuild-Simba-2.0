'use client';

import { useTranslations } from 'next-intl';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, AlertTriangle, LogIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { useBranchStore } from '@/store/branch';
import { useOperationsStore } from '@/store/operations';
import { useAuthStore } from '@/store/auth';
import { formatPrice } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  locale: string;
}

const FREE_DELIVERY_THRESHOLD = 20000;
const DELIVERY_FEE = 2000;

export default function CartDrawer({ open, onClose, locale }: CartDrawerProps) {
  const t = useTranslations('cart');
  const { items, removeItem, updateQuantity, total, itemCount, savings } = useCartStore();
  const { selectedBranchId, getSelectedBranch } = useBranchStore();
  const { fetchStock, getBranchStock, stockByBranch } = useOperationsStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentBranch = getSelectedBranch();

  const [hydrated, setHydrated] = useState(false);
  const stableItems = hydrated ? items : [];
  const stableItemCount = hydrated ? itemCount() : 0;
  const subtotal = hydrated ? total() : 0;
  const totalSavings = hydrated ? savings() : 0;

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const amountToFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progressPct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const orderTotal = subtotal + deliveryFee;

  // Validation: Check if items are in stock at the selected branch
  const stockWarnings = useMemo(() => {
    if (!hydrated) return {};
    const warnings: Record<string, string> = {};
    stableItems.forEach(item => {
      const stock = getBranchStock(selectedBranchId, item.product.id);
      if (stock === 0) {
        warnings[item.product.id] = t('outOfStockBranch');
      } else if (stock < item.quantity) {
        warnings[item.product.id] = t('onlyAvailable', { stock });
      }
    });
    return warnings;
  }, [stableItems, selectedBranchId, getBranchStock, hydrated, t]);

  const hasStockError = Object.keys(stockWarnings).length > 0;

  useEffect(() => {
    setHydrated(true);
    if (open) {
      document.body.style.overflow = 'hidden';
      // Refresh stock for the selected branch when opening cart
      fetchStock(selectedBranchId);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, selectedBranchId, fetchStock]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 touch-none ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-[420px] bg-white dark:bg-slate-900 z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-simba-orange/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-simba-orange" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">{t('title')}</h2>
              {stableItemCount > 0 && (
                <p className="text-xs text-slate-400">{stableItemCount} {t('items')}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free delivery progress bar */}
        {stableItems.length > 0 && (
          <div className="px-5 py-3 bg-orange-50 dark:bg-orange-950/30 border-b border-orange-100 dark:border-orange-900/30">
            {deliveryFee === 0 ? (
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                🎉 {t('freeDeliveryUnlocked')}
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                {t('freeDeliveryProgress', { amount: formatPrice(amountToFree) })}
              </p>
            )}
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-simba-orange to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {stableItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-lg mb-1">{t('empty')}</p>
              <p className="text-sm text-slate-400 mb-6">{t('emptyDesc')}</p>
              <button
                onClick={onClose}
                className="bg-simba-orange text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-simba-orange-dark transition-colors text-sm"
              >
                {t('shopNow')}
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {stableItems.map(item => {
                const itemSaving = item.product.originalPrice
                  ? (item.product.originalPrice - item.product.price) * item.quantity
                  : 0;
                return (
                  <div key={item.product.id} className="flex gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 group/item">
                    {/* Thumbnail */}
                    <Link href={`/${locale}/products/${item.product.id}`} onClick={onClose} className="relative w-18 h-18 flex-shrink-0">
                      <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <Image src={item.product.image} alt={item.product.name} fill sizes="72px" className="object-cover" />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/${locale}/products/${item.product.id}`} onClick={onClose}>
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 hover:text-simba-orange transition-colors leading-snug">
                          {item.product.name}
                        </p>
                      </Link>
                      {item.product.unit && (
                        <p className="text-xs text-slate-400 mt-0.5">{item.product.unit}</p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {/* Stepper */}
                        <div className="flex items-center bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-simba-orange hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-7 text-center text-slate-800 dark:text-slate-100">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-simba-orange hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-100">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          {itemSaving > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                              {t('save')} {formatPrice(itemSaving)}
                            </p>
                          )}
                        </div>
                      </div>
                      {stockWarnings[item.product.id] && (
                        <p className="text-[10px] font-bold text-red-500 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {stockWarnings[item.product.id]}
                        </p>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="opacity-0 group-hover/item:opacity-100 self-start mt-0.5 p-1 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {stableItems.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            {/* Savings banner */}
            {totalSavings > 0 && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30 rounded-xl px-3 py-2">
                <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                  {t('savingsBanner', { amount: formatPrice(totalSavings) })}
                </p>
              </div>
            )}

              <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>{t('subtotal')}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t('delivery')}</span>
                <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {deliveryFee === 0 ? `🎉 ${t('deliveryFree')}` : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-800 dark:text-slate-100">{t('total')}</span>
                <span className="text-simba-orange">{formatPrice(orderTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            {hasStockError ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="flex items-center justify-center gap-2 w-full bg-slate-200 dark:bg-slate-800 text-slate-400 py-3.5 rounded-xl font-bold text-sm cursor-not-allowed"
                >
                  {t('checkoutBtn', { total: formatPrice(orderTotal) })}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-red-500 font-bold animate-pulse">
                  {t('fixStockIssues')}
                </p>
              </div>
            ) : !currentUser ? (
              // Not logged in — show sign-in prompt
              <div className="space-y-2">
                <Link
                  href={`/${locale}/auth/login?next=/${locale}/checkout`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full bg-simba-orange hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Checkout
                </Link>
                <p className="text-[10px] text-center text-slate-400">
                  Your cart will be saved
                </p>
              </div>
            ) : (
              <Link
                href={`/${locale}/checkout`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full bg-simba-orange hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
              >
                {t('checkoutBtn', { total: formatPrice(orderTotal) })}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              href={`/${locale}/cart`}
              onClick={onClose}
              className="block w-full text-center text-sm text-slate-500 hover:text-simba-orange transition-colors py-1"
            >
              {t('viewFullCart')}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
