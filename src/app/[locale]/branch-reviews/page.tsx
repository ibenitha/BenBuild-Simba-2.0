'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { simbaBranches } from '@/lib/branches';
import { useOperationsStore } from '@/store/operations';
import { useTranslations } from 'next-intl';
import { Star, MapPin, MessageSquare, Filter, TrendingUp, Users, ChevronRight, CheckCircle2 } from 'lucide-react';

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hovered, setHovered] = useState(0);
  const dim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => {
        const isFilled = i <= (hovered || value);
        const starIcon = (
          <Star
            className={`${dim} transition-colors ${
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-slate-100 text-slate-200 dark:fill-slate-800 dark:text-slate-700'
            }`}
          />
        );

        if (readonly) {
          return <span key={i}>{starIcon}</span>;
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="cursor-pointer hover:scale-125 transition-all duration-200"
            aria-label={`${i} star`}
          >
            {starIcon}
          </button>
        );
      })}
    </div>
  );
}

function BranchReviewsContent() {
  const t = useTranslations('branchReviews');
  const searchParams = useSearchParams();
  const { locale } = useParams();
  const initialBranchId = searchParams.get('branchId');

  const reviews = useOperationsStore(s => s.reviews);
  const addReview = useOperationsStore(s => s.addReview);
  const fetchReviews = useOperationsStore(s => s.fetchReviews);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const [selectedBranch, setSelectedBranch] = useState(
    initialBranchId && simbaBranches.some(b => b.id === initialBranchId)
      ? initialBranchId
      : simbaBranches[0].id
  );

  useEffect(() => {
    if (initialBranchId && simbaBranches.some(b => b.id === initialBranchId)) {
      setSelectedBranch(initialBranchId);
    }
  }, [initialBranchId]);

  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const branchStats = useMemo(() =>
    simbaBranches.map(branch => {
      const br = reviews.filter(r => r.branchId === branch.id);
      const avg = br.length ? br.reduce((s, r) => s + r.rating, 0) / br.length : 0;
      return { ...branch, avg, count: br.length };
    }).sort((a, b) => b.avg - a.avg),
    [reviews]
  );

  const allReviewsForBranch = useMemo(() =>
    reviews.filter(r => r.branchId === selectedBranch).slice().reverse(),
    [reviews, selectedBranch]
  );

  const branchReviews = useMemo(() =>
    filterRating 
      ? allReviewsForBranch.filter(r => r.rating === filterRating)
      : allReviewsForBranch,
    [allReviewsForBranch, filterRating]
  );

  const currentStats = branchStats.find(b => b.id === selectedBranch);
  const selectedBranchName = simbaBranches.find(b => b.id === selectedBranch)?.name || '';

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
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header section with Stats */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-simba-orange font-bold text-sm tracking-wider uppercase">
                <TrendingUp className="w-4 h-4" />
                {t('branchFeedback')}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
              <p className="text-slate-500 max-w-xl leading-relaxed">{t('subtitle')}</p>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{reviews.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('totalReviews')}</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('globalAvg')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* ── Left: Branch List (4 cols) ── */}
          <section className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-simba-orange" />
                {t('branchRatings')}
              </h2>
            </div>
            
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {branchStats.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranch(branch.id);
                    setFilterRating(null);
                  }}
                  className={`group w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                    selectedBranch === branch.id
                      ? 'bg-white dark:bg-slate-800 border-simba-orange shadow-xl shadow-orange-100 dark:shadow-none translate-x-1'
                      : 'bg-white/50 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className={`font-bold transition-colors truncate ${
                        selectedBranch === branch.id ? 'text-simba-orange text-base' : 'text-slate-700 dark:text-slate-300 text-sm'
                      }`}>
                        {branch.name.replace('Simba Supermarket ', '')}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <StarRating value={Math.round(branch.avg)} readonly size="sm" />
                        <span className="text-[10px] font-black text-slate-400">
                          {branch.count > 0 ? `${branch.avg.toFixed(1)}` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className={`flex flex-col items-end flex-shrink-0 ${selectedBranch === branch.id ? 'opacity-100' : 'opacity-40'}`}>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{branch.count} {t('allReviews')}</span>
                      <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${selectedBranch === branch.id ? 'translate-x-1 text-simba-orange' : 'text-slate-400'}`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ── Right: Content (8 cols) ── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Selected Branch Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    {selectedBranchName}
                  </h2>
                  <div className="flex items-center gap-3">
                    <StarRating value={Math.round(currentStats?.avg || 0)} readonly size="md" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {currentStats?.avg.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-slate-400 text-sm font-medium">/ 5.0</span>
                    </div>
                    <span className="text-slate-300 mx-1">·</span>
                    <span className="text-slate-500 text-sm font-medium">{currentStats?.count || 0} {t('customerReviews')}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-simba-orange hover:bg-simba-orange-dark text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-orange-100 dark:shadow-none hover:-translate-y-0.5"
                >
                  {t('writeReview')}
                </button>
              </div>

              {/* Review Filters */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  {t('filterBy')}
                </span>
                <button
                  onClick={() => setFilterRating(null)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    filterRating === null 
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {t('allReviews')}
                </button>
                {[5, 4, 3, 2, 1].map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRating(r)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      filterRating === r 
                        ? 'bg-yellow-400 text-slate-900 border-yellow-400' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {r} <Star className={`w-3 h-3 ${filterRating === r ? 'fill-slate-900' : 'fill-yellow-400 text-yellow-400'}`} />
                  </button>
                ))}
              </div>

              {/* Reviews Feed */}
              <div className="space-y-6">
                {branchReviews.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">{t('noReviewsFound')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {branchReviews.map(review => (
                      <div key={review.id} className="group p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-simba-orange to-orange-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-100 dark:shadow-none">
                              {review.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white">{review.customerName}</p>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {new Date(review.createdAt).toLocaleDateString(locale === 'rw' ? 'rw-RW' : locale === 'fr' ? 'fr-FR' : 'en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <StarRating value={review.rating} readonly size="sm" />
                            <span className="text-[10px] font-black text-slate-300 uppercase">{t('verifiedPurchase')}</span>
                          </div>
                        </div>
                        <div className="relative pl-15">
                           <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700/50" />
                           <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic pr-4">
                            &quot;{review.comment}&quot;
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Write a review form */}
            <div id="review-form" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <MessageSquare className="w-32 h-32 text-slate-900 dark:text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-simba-orange/10 flex items-center justify-center text-simba-orange">
                    <Star className="w-5 h-5 fill-simba-orange" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {t('leaveReview')}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {t('sharingExperience', { branch: selectedBranchName })}
                    </p>
                  </div>
                </div>

                {submitted && (
                  <div className="mb-8 bg-green-500 text-white rounded-2xl px-6 py-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                    <div>
                      <p className="font-black text-sm">{t('reviewSuccess')}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('customerName')}</label>
                    <input
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder={t('anonymous')}
                      className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:outline-none focus:border-simba-orange focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('yourRating')}</label>
                    <div className="h-[52px] flex items-center">
                      <StarRating value={rating} onChange={setRating} size="lg" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('detailedFeedback')}</label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      rows={4}
                      required
                      placeholder={t('commentPlaceholder')}
                      className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:border-simba-orange focus:bg-white dark:focus:bg-slate-900 transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={!comment.trim()}
                      className="w-full bg-simba-orange hover:bg-simba-orange-dark text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-orange-100 dark:shadow-none hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {t('submit')}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                      {t('reviewGuidelines')}
                    </p>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function BranchReviewsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('branchReviews');
  return (
    <Suspense fallback={<div className="p-8 text-center">{t('loading')}</div>}>
      <BranchReviewsContent />
    </Suspense>
  );
}
