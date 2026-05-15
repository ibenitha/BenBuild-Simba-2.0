'use client';

import { useState } from 'react';
import { useCouponStore } from '@/store/coupons';
import { Tag, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CouponInput() {
  const [code, setCode] = useState('');
  const { activeCoupon, applyCoupon, removeCoupon } = useCouponStore();
  const [error, setError] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = applyCoupon(code);
    if (!result.success) {
      setError(result.message);
    } else {
      setCode('');
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-simba-orange" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">Apply Coupon</span>
      </div>

      <AnimatePresence mode="wait">
        {activeCoupon ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 px-3 py-2.5 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs font-black text-green-700 dark:text-green-400">{activeCoupon.code}</p>
                <p className="text-[10px] text-green-600/80">{activeCoupon.discountPct}% Discount Applied</p>
              </div>
            </div>
            <button
              onClick={removeCoupon}
              className="p-1 hover:bg-green-200 dark:hover:bg-green-900/40 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 text-green-700" />
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleApply}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="PROMO10"
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-simba-orange"
              />
              <button
                type="submit"
                disabled={!code}
                className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-simba-orange transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {error && <p className="text-[10px] text-red-500 font-medium pl-1">{error}</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
