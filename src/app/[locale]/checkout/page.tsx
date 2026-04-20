'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Smartphone, CreditCard, Banknote, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

interface CheckoutPageProps {
  params: { locale: string };
}

const DISTRICTS = ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Maramagambi', 'Ngoma', 'Nyagatare', 'Rwamagana'];

export default function CheckoutPage({ params: { locale } }: CheckoutPageProps) {
  const t = useTranslations('checkout');
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'cash' | 'card'>('momo');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', district: 'Gasabo', momoNumber: '' });

  const deliveryFee = total() >= 20000 ? 0 : 2000;
  const orderTotal = total() + deliveryFee;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setStep('success');
    clearCart();
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-100 dark:border-slate-700">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-simba-green" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">{t('success')}</h1>
          <p className="text-slate-500 mb-2">{t('successDesc')}</p>
          <p className="text-sm text-slate-400 mb-8">Order #SB{Date.now().toString().slice(-6)}</p>
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Delivery to:</strong> {form.address}, {form.district}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1"><strong>Payment:</strong> {paymentMethod === 'momo' ? 'Mobile Money' : paymentMethod === 'cash' ? 'Cash on Delivery' : 'Card'}</p>
          </div>
          <Link href={`/${locale}`} className="block w-full bg-simba-green text-white py-3 rounded-xl font-semibold hover:bg-simba-green-dark transition-colors">
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">{t('title')}</h1>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {['details', 'payment'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === s || (step === 'payment' && s === 'details') ? 'bg-simba-green text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              {i + 1}
            </div>
            <span className={`text-sm font-medium ${step === s ? 'text-simba-green' : 'text-slate-400'}`}>
              {s === 'details' ? t('delivery') : t('payment')}
            </span>
            {i < 1 && <ChevronRight className="w-4 h-4 text-slate-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t('delivery')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('name')}</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-simba-green text-sm" placeholder="Jean Baptiste" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('phone')}</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-simba-green text-sm" placeholder="+250 788 000 000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('address')}</label>
                <input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-simba-green text-sm" placeholder="KG 123 St, Kigali" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('district')}</label>
                <select value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-simba-green text-sm">
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-simba-green text-white py-3 rounded-xl font-semibold hover:bg-simba-green-dark transition-colors">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handlePlaceOrder} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{t('payment')}</h2>

              {/* Payment methods */}
              <div className="space-y-3">
                {[
                  { id: 'momo', label: t('momo'), icon: <Smartphone className="w-5 h-5" />, desc: 'MTN MoMo or Airtel Money', badge: 'Recommended' },
                  { id: 'cash', label: t('cash'), icon: <Banknote className="w-5 h-5" />, desc: 'Pay when your order arrives', badge: null },
                  { id: 'card', label: t('card'), icon: <CreditCard className="w-5 h-5" />, desc: 'Visa, Mastercard', badge: null },
                ].map(method => (
                  <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-simba-green bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id as 'momo' | 'cash' | 'card'} onChange={() => setPaymentMethod(method.id as 'momo' | 'cash' | 'card')} className="sr-only" />
                    <div className={`${paymentMethod === method.id ? 'text-simba-green' : 'text-slate-400'}`}>{method.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-800 dark:text-slate-100">{method.label}</span>
                        {method.badge && <span className="bg-simba-green text-white text-xs px-2 py-0.5 rounded-full">{method.badge}</span>}
                      </div>
                      <p className="text-xs text-slate-500">{method.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-simba-green' : 'border-slate-300'}`}>
                      {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-simba-green" />}
                    </div>
                  </label>
                ))}
              </div>

              {/* MoMo number input */}
              {paymentMethod === 'momo' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('momoNumber')}</label>
                  <input
                    required
                    value={form.momoNumber}
                    onChange={e => setForm({...form, momoNumber: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-simba-orange text-sm"
                    placeholder="+250 788 000 000"
                  />
                  <p className="text-xs text-slate-500 mt-2">💡 You will receive a payment prompt on your phone</p>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('details')} className="flex-1 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-medium hover:border-simba-green hover:text-simba-green transition-colors">
                  Back
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-simba-green text-white py-3 rounded-xl font-semibold hover:bg-simba-green-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : t('placeOrder')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 sticky top-24">
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">{t('orderSummary')}</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-slate-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-simba-green">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatPrice(total())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery</span>
                <span className={deliveryFee === 0 ? 'text-simba-green' : ''}>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-slate-200 dark:border-slate-700 pt-2">
                <span>Total</span>
                <span className="text-simba-green">{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}