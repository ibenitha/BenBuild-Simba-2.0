'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewStore {
  reviews: ProductReview[];
  addReview: (review: ProductReview) => void;
  getProductReviews: (productId: string) => ProductReview[];
  getProductRating: (productId: string) => { avg: number; count: number };
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      reviews: [],
      addReview: (review) => set({ reviews: [review, ...get().reviews] }),
      getProductReviews: (productId) => get().reviews.filter(r => r.productId === productId),
      getProductRating: (productId) => {
        const productReviews = get().reviews.filter(r => r.productId === productId);
        if (productReviews.length === 0) return { avg: 0, count: 0 };
        const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        return { avg, count: productReviews.length };
      }
    }),
    { name: 'simba-product-reviews' }
  )
);
