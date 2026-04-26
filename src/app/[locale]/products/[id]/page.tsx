import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getProductById, products } from '@/lib/products';
import { Star, ArrowLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductGrid from '@/components/products/ProductGrid';
import RecentlyViewed from '@/components/products/RecentlyViewed';
import ViewTracker from '@/components/products/ViewTracker';

interface ProductPageProps {
  params: { locale: string; id: string };
}

export default async function ProductPage({ params: { locale, id } }: ProductPageProps) {
  const product = getProductById(id);
  if (!product) notFound();

  const t = await getTranslations('product');

  const related = products
    .filter(p => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 5);

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <ViewTracker product={product} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6 flex-wrap">
          <Link href={`/${locale}`} className="hover:text-simba-orange transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/${locale}/products`} className="hover:text-simba-orange transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/${locale}/products?category=${product.categorySlug}`} className="hover:text-simba-orange transition-colors">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            {product.originalPrice && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg">
                -{discountPct}% {t('off')}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <Link href={`/${locale}/products?category=${product.categorySlug}`} className="text-simba-orange text-sm font-semibold hover:underline mb-2 w-fit">
              {product.category}
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3 leading-tight">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-600'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{product.rating}</span>
                {product.reviews && (
                  <span className="text-sm text-slate-400">({product.reviews} {t('reviews')})</span>
                )}
              </div>
            )}

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
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('unit')}:</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{product.unit}</span>
              </div>
            )}

            {/* Description */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 text-sm uppercase tracking-wide">{t('description')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{product.description}</p>
            </div>

            <AddToCartButton product={product} />

            <Link href={`/${locale}/products?category=${product.categorySlug}`} className="flex items-center gap-2 text-slate-400 hover:text-simba-orange transition-colors text-sm mt-5 w-fit">
              <ArrowLeft className="w-4 h-4" />
              {t('backTo', { category: product.category })}
            </Link>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('relatedProducts')}</h2>
              <Link href={`/${locale}/products?category=${product.categorySlug}`} className="text-simba-orange text-sm font-medium hover:underline flex items-center gap-1">
                {product.category} <ChevronRight className="w-4 h-4" />
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
