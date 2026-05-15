'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Coupon {
  code: string;
  discountPct: number;
  description: string;
}

const VALID_COUPONS: Coupon[] = [
  { code: 'SIMBA10', discountPct: 10, description: '10% off your entire order' },
  { code: 'FRESH20', discountPct: 20, description: '20% off fresh produce' },
  { code: 'WELCOME5', discountPct: 5, description: '5% off for new members' },
];

interface CouponStore {
  activeCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  getDiscount: (subtotal: number) => number;
}

export const useCouponStore = create<CouponStore>()(
  persist(
    (set, get) => ({
      activeCoupon: null,
      applyCoupon: (code) => {
        const coupon = VALID_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
        if (coupon) {
          set({ activeCoupon: coupon });
          return { success: true, message: `Coupon applied: ${coupon.description}` };
        }
        return { success: false, message: 'Invalid coupon code.' };
      },
      removeCoupon: () => set({ activeCoupon: null }),
      getDiscount: (subtotal) => {
        const coupon = get().activeCoupon;
        if (!coupon) return 0;
        return (subtotal * coupon.discountPct) / 100;
      }
    }),
    { name: 'simba-coupons' }
  )
);
