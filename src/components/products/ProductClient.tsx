'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { products } from '@/lib/products';
import { Star, ArrowLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductGrid from '@/components/products/ProductGrid';
import RecentlyViewed from '@/components/products/RecentlyViewed';
import ViewTracker from '@/components/products/ViewTracker';
import ProductReviews from '@/components/products/ProductReviews';
import { useReviewStore } from '@/store/reviews';
import { useMemo, useState, useEffect } from 'react';
import { Product } from '@/types';
import ProductDetailSkeleton from '@/components/ui/ProductDetailSkeleton';

interface ProductClientProps {
  product: Product;
  locale: string;
  id: string;
}

export default function ProductClient({ product, locale, id }: ProductClientProps) {
  const t = useTranslations('product');
  const { getProductRating } = useReviewStore();
  const { avg, count } = getProductRating(id);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const related = useMemo(() => products
    .filter(p => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 5), [product]);

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  if (!mounted) return <ProductDetailSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <ViewTracker product={product} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6 flex-wrap">
          <Link href={`/${locale}`} className="hover:text-simba-orange transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/${locale}/category/${product.categorySlug}`} className="hover:text-simba-orange transition-colors">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          {/* Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-xl bg-red-500 px-6 py-2 rounded-full">{t('outOfStock')}</span>
              </div>
            )}
            {product.originalPrice && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg">
                -{discountPct}% {t('off')}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <Link href={`/${locale}/category/${product.categorySlug}`} className="text-simba-orange text-sm font-semibold hover:underline mb-2 w-fit">
              {product.category}
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(avg || product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-600'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{(avg || product.rating || 0).toFixed(1)}</span>
              <span className="text-sm text-slate-400">({(count || product.reviews || 0)} {t('reviews')})</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black text-simba-orange">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xl text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            {product.originalPrice && (
              <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-4">
                {t('youSave', { amount: formatPrice(product.originalPrice - product.price) })}
              </p>
            )}

            {product.unit && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('unit')}:</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{product.unit}</span>
              </div>
            )}

            {/* Stock */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold w-fit mb-6 ${product.inStock ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              {product.inStock ? t('inStock') : t('outOfStock')}
            </div>

            {/* Description */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 text-sm uppercase tracking-wide">{t('description')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{product.description}</p>
            </div>

            <AddToCartButton product={product} />

            <Link href={`/${locale}/category/${product.categorySlug}`} className="flex items-center gap-2 text-slate-400 hover:text-simba-orange transition-colors text-sm mt-5 w-fit">
              <ArrowLeft className="w-4 h-4" />
              {t('backTo', { category: product.category })}
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mb-24 pt-12 border-t border-slate-100 dark:border-slate-800">
          <ProductReviews productId={id} locale={locale} />
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{t('relatedProducts')}</h2>
              <Link href={`/${locale}/category/${product.categorySlug}`} className="text-simba-orange text-sm font-bold hover:underline flex items-center gap-1">
                View Category <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductGrid products={related} locale={locale} />
          </section>
        )}

        <RecentlyViewed locale={locale} excludeId={product.id} />
      </div>
    </div>
  );
}
