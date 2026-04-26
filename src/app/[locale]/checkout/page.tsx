'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useBranchStore } from '@/store/branch';
import { useOperationsStore } from '@/store/operations';
import { simbaBranches } from '@/lib/branches';
import { formatPrice, cn } from '@/lib/utils';
import { Star, MapPin, Loader2, CreditCard, CheckCircle, Navigation, Phone, Truck, Package, ChevronRight, Store, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const PICKUP_SLOTS = ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '16:00 - 18:00'];
const KIGALI_DISTRICTS = ['Gasabo', 'Nyarugenge', 'Kicukiro'];
const DEFAULT_DEPOSIT = 500;
const DELIVERY_FEE = 2000;
const FREE_DELIVERY_THRESHOLD = 20000;

export default function CheckoutPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('pickupCheckout');
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const user = useAuthStore(s => s.currentUser);
  const { selectedBranchId } = useBranchStore();
  const { 
    getBranchStock, fetchStock, stockByBranch, placePickupOrder, 
    reviews, fetchReviews, getRequiredDeposit, fetchCustomerFlags 
  } = useOperationsStore();

  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [branchId, setBranchId] = useState(selectedBranchId);
  const [slot, setSlot] = useState(PICKUP_SLOTS[1]);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDistrict, setDeliveryDistrict] = useState(KIGALI_DISTRICTS[0]);
  
  const [step, setStep] = useState<'pickup' | 'deposit' | 'done'>('pickup');
  const [orderId, setOrderId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    fetchStock(branchId);
    fetchReviews();
    if (user) {
      fetchCustomerFlags(user.email);
    }
  }, [branchId, fetchStock, fetchReviews, user, fetchCustomerFlags]);

  const stableItems = hydrated ? items : [];
  const subtotal = hydrated ? total() : 0;
  
  const deliveryFee = orderType === 'delivery' 
    ? (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE)
    : 0;

  const requiredDeposit = user ? getRequiredDeposit(user.email) : DEFAULT_DEPOSIT;
  
  const paymentAmount = orderType === 'delivery' 
    ? subtotal + deliveryFee
    : requiredDeposit;

  const branchStock = useMemo(() => stockByBranch[branchId] ?? {}, [stockByBranch, branchId]);
  const hasOutOfStock = useMemo(
    () => stableItems.some(item => (branchStock[item.product.id] ?? 25) < item.quantity),
    [stableItems, branchStock]
  );

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

  const placeOrder = async () => {
    if (!user) { router.push(`/${locale}/auth/login?next=/${locale}/checkout`); return; }
    setPlacing(true);
    const result = await placePickupOrder({
      userId: user.id,
      customerName: user.fullName || user.email.split('@')[0],
      customerEmail: user.email,
      branchId,
      timeSlot: orderType === 'pickup' ? slot : 'Delivery ASAP',
      deposit: orderType === 'pickup' ? requiredDeposit : 0,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      deliveryDistrict: orderType === 'delivery' ? deliveryDistrict : undefined,
      deliveryFee,
      totalAmount: subtotal + deliveryFee,
      items: stableItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        name: item.product.name,
      })),
    });
    setPlacing(false);
    if (!result) return;
    clearCart();
    setOrderId(result.id);
    setStep('done');
  };

  // Auth gate — show login prompt if not authenticated (and cart has items)
  if (hydrated && !user && stableItems.length > 0 && step !== 'done') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-10 h-10 text-simba-orange" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Sign in to Checkout
        </h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          You need to be signed in to place an order. Your cart will be saved.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/${locale}/auth/login?next=/${locale}/checkout`}
            className="inline-flex items-center justify-center gap-2 bg-simba-orange text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-600 transition-all active:scale-95"
          >
            Sign In to Continue <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/${locale}/auth/register?next=/${locale}/checkout`}
            className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-simba-orange hover:text-simba-orange transition-all"
          >
            Create Account
          </Link>
          <Link href={`/${locale}`} className="text-sm text-slate-400 hover:text-simba-orange transition-colors mt-2">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (stableItems.length === 0 && step !== 'done') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{t('checkout')}</h1>
        <p className="text-slate-500 font-medium mb-10">{t('emptyCart')}</p>
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 bg-simba-orange text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-600 transition-all active:scale-95">
          {t('startShopping')} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">{t('title')}</h1>
          <p className="text-slate-500 font-medium mt-2">{t('subtitle')}</p>
        </div>
        
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 w-fit">
          <button
            onClick={() => setOrderType('pickup')}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              orderType === 'pickup' ? "bg-white dark:bg-slate-700 text-simba-orange shadow-md shadow-slate-200 dark:shadow-none" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Package className="w-4 h-4" />
            Pick-up
          </button>
          <button
            onClick={() => setOrderType('delivery')}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              orderType === 'delivery' ? "bg-white dark:bg-slate-700 text-simba-orange shadow-md shadow-slate-200 dark:shadow-none" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Truck className="w-4 h-4" />
            Delivery
          </button>
        </div>
      </div>

      {step === 'pickup' && (
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Store className="w-32 h-32" />
              </div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-simba-orange/10 text-simba-orange flex items-center justify-center text-xs">1</span>
                  {orderType === 'pickup' ? t('selectBranch') : 'Fulfillment Branch'}
                </h2>
                {orderType === 'pickup' && (
                  <Link href={`/${locale}?changeBranch=true`} className="text-[10px] font-black uppercase tracking-widest text-simba-orange hover:opacity-70 transition-opacity">
                    {t('changeDefaultBranch')}
                  </Link>
                )}
              </div>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {simbaBranches.map(branch => {
                  const rating = branchRatings[branch.id];
                  const active = branch.id === branchId;
                  return (
                    <label key={branch.id} className={cn(
                      "block border-2 rounded-[2rem] p-5 cursor-pointer transition-all active:scale-[0.98]",
                      active ? "border-simba-orange bg-orange-50/50 dark:bg-orange-950/20 shadow-lg shadow-orange-100 dark:shadow-none" : "border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                    )}>
                      <input type="radio" className="sr-only" checked={active} onChange={() => setBranchId(branch.id)} />
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", active ? "bg-simba-orange text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                              <MapPin className="w-5 h-5" />
                           </div>
                           <div>
                             <p className="font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-tight">{branch.name.replace('Simba Supermarket ', '')}</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{branch.district} District</p>
                           </div>
                        </div>
                        {rating?.count > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-400/10 rounded-xl">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-[11px] font-black text-yellow-700 dark:text-yellow-500">{rating.avg.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-simba-orange/10 text-simba-orange flex items-center justify-center text-xs">2</span>
                {orderType === 'pickup' ? t('pickupTimeContact') : 'Delivery Details'}
              </h2>
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('phoneNumber')}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={phone}
                      onChange={e => {
                        setPhone(e.target.value);
                        setPhoneError('');
                      }}
                      onBlur={() => {
                        if (phone && !/^(\+?250|0)?7[2389]\d{7}$/.test(phone.replace(/\s/g, ''))) {
                          setPhoneError('Enter a valid Rwanda phone number (e.g. +250 78x xxx xxx)');
                        }
                      }}
                      placeholder="+250 78x xxx xxx"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl pl-12 pr-4 py-4 text-sm font-black focus:border-simba-orange transition-all outline-none ${phoneError ? 'border-red-400' : 'border-transparent'}`}
                    />
                  </div>
                  {phoneError && <p className="text-xs text-red-500 mt-1 ml-1">{phoneError}</p>}
                </div>
                {orderType === 'pickup' ? (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{t('timeSlot')}</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select value={slot} onChange={e => setSlot(e.target.value)} className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl pl-12 pr-10 py-4 text-sm font-black focus:border-simba-orange transition-all outline-none">
                        {PICKUP_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Delivery District</label>
                      <div className="relative">
                        <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select value={deliveryDistrict} onChange={e => setDeliveryDistrict(e.target.value)} className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl pl-12 pr-10 py-4 text-sm font-black focus:border-simba-orange transition-all outline-none">
                          {KIGALI_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Street Address / Landmark</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                        <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="House number, street name..." rows={3} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:border-simba-orange transition-all outline-none resize-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 p-6 rounded-[2rem] bg-orange-50 dark:bg-orange-950/20 border-2 border-dashed border-orange-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-simba-orange text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200 dark:shadow-none">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">MoMo {orderType === 'pickup' ? 'Deposit' : 'Full Payment'}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                      {orderType === 'pickup' ? `A deposit of ${formatPrice(requiredDeposit)} is required.` : `Full payment of ${formatPrice(subtotal + deliveryFee)} is required upfront.`}
                    </p>
                  </div>
                </div>
              </div>

              <button disabled={!phone || !!phoneError || hasOutOfStock || (orderType === 'delivery' && !deliveryAddress)} onClick={() => setStep('deposit')} className="mt-8 w-full bg-simba-orange text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-orange-200 dark:shadow-none hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50">
                {orderType === 'delivery' ? 'Pay Full Amount Now' : 'Confirm & Pay Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'deposit' && (
        <div className="max-w-md mx-auto">
          <div className="rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-yellow-400 bg-white dark:bg-slate-900">
            <div className="bg-yellow-400 px-8 py-14 text-center relative overflow-hidden">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center font-black text-yellow-500 text-4xl shadow-2xl mx-auto mb-6">M</div>
              <h2 className="font-black text-slate-900 text-3xl tracking-tighter uppercase italic italic">MTN MoMo</h2>
            </div>
            <div className="p-10 space-y-8 text-center">
                <p className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic">{formatPrice(paymentAmount)}</p>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] p-6 space-y-4 text-left border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Grand Total</span>
                    <span>{formatPrice(paymentAmount)}</span>
                  </div>
                </div>
                <button onClick={placeOrder} disabled={placing} className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-yellow-100 flex items-center justify-center gap-3">
                  {placing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                  {placing ? 'Processing...' : 'Simulate Payment'}
                </button>
                <button onClick={() => setStep('pickup')} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-simba-orange">Back</button>
            </div>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="max-w-lg mx-auto">
          {/* Success card */}
          <div className="border-4 border-green-500 rounded-[3.5rem] overflow-hidden bg-white dark:bg-slate-900 shadow-2xl mb-6">
            <div className="bg-green-500 px-8 py-12 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute w-32 h-32 rounded-full bg-white" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, transform: 'translate(-50%,-50%)' }} />
                ))}
              </div>
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 text-green-500 shadow-xl relative z-10">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter relative z-10">ORDER PLACED!</h2>
              <p className="text-green-100 text-sm mt-1 relative z-10">Your order is confirmed</p>
            </div>
            <div className="p-8 space-y-4">
              {/* Order ID */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Order ID</p>
                <p className="text-2xl font-black text-simba-orange tracking-tight">#{orderId}</p>
              </div>

              {/* What happens next */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">What happens next</p>
                {[
                  { icon: '📋', step: '1', text: 'Branch receives your order instantly' },
                  { icon: '👨‍🍳', step: '2', text: 'Staff prepares your items' },
                  { icon: orderType === 'delivery' ? '🚚' : '🏪', step: '3', text: orderType === 'delivery' ? 'Delivered to your address' : 'Ready for pick-up at your branch' },
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl px-4 py-3">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <Link href={`/${locale}/orders`} className="flex items-center justify-center gap-2 w-full bg-simba-orange text-white px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-200 dark:shadow-none">
                  <Package className="w-4 h-4" /> Track My Order
                </Link>
                <Link href={`/${locale}/branch-dashboard`} className="block w-full border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center hover:border-simba-orange hover:text-simba-orange transition-all">
                  Live Branch Status
                </Link>
                <Link href={`/${locale}`} className="block w-full border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center hover:border-simba-orange hover:text-simba-orange transition-all">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
