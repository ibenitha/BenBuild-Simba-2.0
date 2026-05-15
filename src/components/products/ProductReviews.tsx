'use client';

import { useState } from 'react';
import { useReviewStore, ProductReview } from '@/store/reviews';
import { useAuthStore } from '@/store/auth';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductReviewsProps {
  productId: string;
  locale: string;
}

export default function ProductReviews({ productId, locale }: ProductReviewsProps) {
  const { reviews, addReview, getProductReviews, getProductRating } = useReviewStore();
  const { currentUser } = useAuthStore();
  const productReviews = getProductReviews(productId);
  const { avg, count } = getProductRating(productId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    addReview({
      id: `rev-${Date.now()}`,
      productId,
      userId: currentUser.email,
      userName: currentUser.fullName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    });
    setComment('');
    setRating(5);
  };

  return (
    <div className="space-y-12">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-simba-orange" />
            Customer Reviews
          </h2>
          <p className="text-slate-500 mt-1">Based on {count} reviews from verified shoppers.</p>
        </div>

        {count > 0 && (
          <div className="flex items-center gap-6 bg-white dark:bg-slate-900 px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="text-center">
              <p className="text-4xl font-black text-slate-800 dark:text-slate-100">{avg.toFixed(1)}</p>
              <div className="flex mt-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-3 h-3 ${i <= Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                ))}
              </div>
            </div>
            <div className="h-10 w-px bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-1">
              {[5,4,3,2,1].map(star => {
                const starCount = productReviews.filter(r => r.rating === star).length;
                const pct = (starCount / count) * 100;
                return (
                  <div key={star} className="flex items-center gap-2 min-w-[120px]">
                    <span className="text-[10px] font-bold text-slate-400 w-3">{star}</span>
                    <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Write Review */}
        <div className="lg:col-span-1">
          {currentUser ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm sticky top-24">
              <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 mb-6">Write a Review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i)}
                        className="p-1 transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star className={`w-8 h-8 ${i <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-800'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Comment</label>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like or dislike about this product?"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange min-h-[120px] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-simba-orange hover:bg-simba-orange-dark text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none"
                >
                  <Send className="w-4 h-4" />
                  Post Review
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-slate-300" />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Want to review this?</p>
              <p className="text-sm text-slate-500 mt-1 mb-6">You must be logged in to share your experience.</p>
              <button
                onClick={() => window.location.href = `/${locale}/auth/login`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:border-simba-orange hover:text-simba-orange transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Review List */}
        <div className="lg:col-span-2 space-y-6">
          {productReviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-transparent">
              <p className="text-slate-400 italic">No reviews yet for this product. Be the first to share your thoughts!</p>
            </div>
          ) : (
            productReviews.map((review) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={review.id}
                className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm"
              >
                <div className="flex justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-simba-orange/10 flex items-center justify-center text-simba-orange font-black">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{review.userName}</p>
                      <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-100 dark:text-slate-800'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
