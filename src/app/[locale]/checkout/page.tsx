'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useOperationsStore } from '@/store/operations';
import { simbaBranches } from '@/lib/branches';
import { formatPrice } from '@/lib/utils';
import { Star, MapPin } from 'lucide-react';

const PICKUP_SLOTS = ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '16:00 - 18:00'];
const DEFAULT_DEPOSIT = 500;

export default function CheckoutPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('pickupCheckout');
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.currentUser);
  const seedBranchStock = useOperationsStore((s) => s.seedBranchStock);
  const getBranchStock = useOperationsStore((s) => s.getBranchStock);
  const placePickupOrder = useOperationsStore((s) => s.placePickupOrder);
  const reviews = useOperationsStore((s) => s.reviews);

  // Branch ratings derived from reviews
  const branchRatings = useMemo(() =>
    simbaBranches.reduce<Record<string, { avg: number; count: number }>>((acc, b) => {
      const br = reviews.filter(r => r.branchId === b.id);
      acc[b.id] = {
        avg: br.length ? br.reduce((s, r) => s + r.rating, 0) / br.length : 0,
        count: br.length,
      };
      return acc;
    }, {}),
    [reviews]
  );

  const [branchId, setBranchId] = useState(simbaBranches[0].id);
  const [slot, setSlot] = useState(PICKUP_SLOTS[1]);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'pickup' | 'deposit' | 'done'>('pickup');
  const [orderId, setOrderId] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    seedBranchStock(simbaBranches.map((branch) => branch.id));
  }, [seedBranchStock]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const stableItems = hydrated ? items : [];
  const subtotal = hydrated ? total() : 0;
  const hasOutOfStock = useMemo(
    () => stableItems.some((item) => getBranchStock(branchId, item.product.id) < item.quantity),
    [stableItems, branchId, getBranchStock]
  );

  const placeOrder = () => {
    if (!user) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    const created = placePickupOrder({
      customerName: user.fullName,
      customerEmail: user.email,
      branchId,
      timeSlot: slot,
      deposit: DEFAULT_DEPOSIT,
      items: stableItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        name: item.product.name,
      })),
    });
    clearCart();
    setOrderId(created.id);
    setStep('done');
  };

  if (stableItems.length === 0 && step !== 'done') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-3">{t('checkout')}</h1>
        <p className="text-slate-500 mb-6">{t('emptyCart')}</p>
        <Link href={`/${locale}`} className="bg-simba-orange text-white px-5 py-3 rounded-xl font-semibold">{t('startShopping')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-slate-500 mb-8">{t('subtitle')}</p>

      {step === 'pickup' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="border rounded-2xl p-5 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold mb-4">{t('selectBranch')}</h2>
            <div className="space-y-2">
              {simbaBranches.map((branch) => {
                const rating = branchRatings[branch.id];
                return (
                  <label key={branch.id} className={`block border rounded-xl p-3 cursor-pointer transition-colors ${branch.id === branchId ? 'border-simba-orange bg-orange-50 dark:bg-orange-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                    <input type="radio" className="sr-only" checked={branch.id === branchId} onChange={() => setBranchId(branch.id)} />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{branch.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {branch.district} {t('district')}
                        </p>
                      </div>
                      {rating.count > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{rating.avg.toFixed(1)}</span>
                          <span className="text-xs text-slate-400">({rating.count})</span>
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="border rounded-2xl p-5 bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold mb-4">{t('pickupTimeContact')}</h2>
            <label className="block text-sm mb-2">{t('phoneNumber')}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 7xx xxx xxx" className="w-full border rounded-xl px-4 py-2.5 mb-4 bg-transparent" />
            <label className="block text-sm mb-2">{t('timeSlot')}</label>
            <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 bg-transparent">
              {PICKUP_SLOTS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm">
              <p className="font-semibold mb-1">{t('stockCheck')}</p>
              <p className={hasOutOfStock ? 'text-red-600' : 'text-green-600'}>
                {hasOutOfStock ? t('outOfStock') : t('allAvailable')}
              </p>
            </div>

            <button
              disabled={!phone || hasOutOfStock}
              onClick={() => setStep('deposit')}
              className="mt-5 w-full bg-simba-orange text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {t('continueToDeposit')}
            </button>
          </div>
        </div>
      )}

      {step === 'deposit' && (
        <div className="max-w-md mx-auto">
          {/* MoMo mock payment card */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
            {/* MoMo header */}
            <div className="bg-yellow-400 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-yellow-500 text-lg shadow">M</div>
              <div>
                <p className="font-black text-slate-900 text-lg leading-tight">MTN MoMo</p>
                <p className="text-xs text-slate-700">Mobile Money Payment</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="text-center py-2">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Deposit amount</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white">{formatPrice(DEFAULT_DEPOSIT)}</p>
                <p className="text-xs text-slate-500 mt-1">Non-refundable pick-up deposit</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('branchLabel')}</span>
                  <span className="font-semibold text-right max-w-[55%]">{simbaBranches.find(b => b.id === branchId)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('timeLabel')}</span>
                  <span className="font-semibold">{slot}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <span className="text-slate-500">{t('subtotalLabel')}</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('depositLabel')}</span>
                  <span className="font-bold text-yellow-600">{formatPrice(DEFAULT_DEPOSIT)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center leading-relaxed">
                {t('depositDescription', { amount: DEFAULT_DEPOSIT })}
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep('pickup')}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm hover:border-slate-400 transition-colors"
                >
                  {t('back')}
                </button>
                <button
                  onClick={placeOrder}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 py-3 rounded-xl font-black text-sm transition-colors shadow-md"
                >
                  {t('simulatePayment')} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="max-w-md mx-auto border rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
          <div className="bg-green-500 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-black text-white">{t('orderConfirmed')}</h2>
            <p className="text-green-100 text-sm mt-1">{t('orderId')}: <span className="font-bold text-white">{orderId}</span></p>
          </div>
          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{t('orderConfirmedDescription')}</p>
            <div className="flex flex-col gap-3">
              <Link href={`/${locale}/branch-dashboard`} className="w-full bg-simba-orange text-white px-4 py-3 rounded-xl font-bold text-sm text-center hover:bg-simba-orange-dark transition-colors">
                {t('openBranchDashboard')}
              </Link>
              <Link href={`/${locale}/branch-reviews`} className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-3 rounded-xl font-bold text-sm text-center transition-colors">
                ⭐ Rate your pick-up experience
              </Link>
              <Link href={`/${locale}`} className="w-full border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl font-semibold text-sm text-center hover:border-simba-orange transition-colors">
                {t('continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
