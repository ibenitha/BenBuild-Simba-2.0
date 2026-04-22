'use client';

import { useMemo, useState } from 'react';
import { simbaBranches } from '@/lib/branches';
import { useOperationsStore } from '@/store/operations';
import { useTranslations } from 'next-intl';
import { Star, MapPin, MessageSquare } from 'lucide-react';

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}) {
  const [hovered, setHovered] = useState(0);
  const dim = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type={readonly ? 'button' : 'button'}
          disabled={readonly}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          aria-label={`${i} star`}
        >
          <Star
            className={`${dim} transition-colors ${
              i <= (hovered || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function BranchReviewsPage() {
  const t = useTranslations('branchReviews');
  const reviews = useOperationsStore(s => s.reviews);
  const addReview = useOperationsStore(s => s.addReview);

  const [selectedBranch, setSelectedBranch] = useState(simbaBranches[0].id);
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const branchStats = useMemo(() =>
    simbaBranches.map(branch => {
      const br = reviews.filter(r => r.branchId === branch.id);
      const avg = br.length ? br.reduce((s, r) => s + r.rating, 0) / br.length : 0;
      return { ...branch, avg, count: br.length };
    }),
    [reviews]
  );

  const branchReviews = useMemo(() =>
    reviews.filter(r => r.branchId === selectedBranch).slice().reverse(),
    [reviews, selectedBranch]
  );

  const currentStats = branchStats.find(b => b.id === selectedBranch);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addReview({
      branchId: selectedBranch,
      customerName: customerName.trim() || t('anonymous'),
      rating,
      comment: comment.trim(),
    });
    setComment('');
    setCustomerName('');
    setRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{t('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: Branch ratings overview ── */}
        <section className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-simba-orange" />
            <h2 className="font-bold text-slate-900 dark:text-white">{t('branchRatings')}</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {branchStats.map(branch => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`w-full text-left px-5 py-3.5 transition-colors ${
                  selectedBranch === branch.id
                    ? 'bg-orange-50 dark:bg-orange-950/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <p className={`text-sm font-semibold leading-tight ${selectedBranch === branch.id ? 'text-simba-orange' : 'text-slate-800 dark:text-slate-200'}`}>
                  {branch.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating value={Math.round(branch.avg)} readonly size="sm" />
                  <span className="text-xs text-slate-500">
                    {branch.count > 0
                      ? `${branch.avg.toFixed(1)} (${branch.count})`
                      : t('noReviews')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Right: Review form + reviews list ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Write a review */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-simba-orange" />
              {t('leaveReview')} — {simbaBranches.find(b => b.id === selectedBranch)?.name}
            </h2>

            {submitted && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400 font-medium">
                ✓ Review submitted — thank you!
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('customerName')}</label>
                <input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder={t('anonymous')}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your rating</label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('commentPlaceholder')}</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  required
                  placeholder={t('commentPlaceholder')}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!comment.trim()}
                className="bg-simba-orange hover:bg-simba-orange-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                {t('submit')}
              </button>
            </form>
          </div>

          {/* Reviews list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white">
                Reviews for {simbaBranches.find(b => b.id === selectedBranch)?.name}
              </h2>
              {currentStats && currentStats.count > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(currentStats.avg)} readonly size="sm" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {currentStats.avg.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">({currentStats.count})</span>
                </div>
              )}
            </div>

            {branchReviews.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">{t('noReviews')}</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {branchReviews.map(review => (
                  <div key={review.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-simba-orange/10 flex items-center justify-center text-simba-orange font-bold text-sm flex-shrink-0">
                          {review.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{review.customerName}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <StarRating value={review.rating} readonly size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 ml-10 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
