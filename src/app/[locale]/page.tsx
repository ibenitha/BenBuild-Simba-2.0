'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { categories, products, searchProducts } from '@/lib/products';
import ProductGrid from '@/components/products/ProductGrid';
import RecentlyViewed from '@/components/products/RecentlyViewed';
import HeroBanner, { HeroSlide } from '@/components/products/HeroBanner';
import PromoRail from '@/components/products/PromoRail';
import { motion } from 'framer-motion';
import {
  ArrowRight, MapPin, ChevronRight, LayoutGrid, Star, Trophy
} from 'lucide-react';

interface HomePageProps {
  params: { locale: string };
  searchParams: { search?: string; category?: string };
}

// Per-category color palette for the grid cards
const CATEGORY_PALETTE: Record<string, { bg: string; text: string; accent: string }> = {
  'cosmetics-and-personal-care': { bg: 'bg-pink-50 dark:bg-pink-950/30',    text: 'text-pink-700 dark:text-pink-300',   accent: 'bg-pink-100 dark:bg-pink-900/40' },
  'sports-and-wellness':         { bg: 'bg-green-50 dark:bg-green-950/30',  text: 'text-green-700 dark:text-green-300', accent: 'bg-green-100 dark:bg-green-900/40' },
  'baby-products':               { bg: 'bg-sky-50 dark:bg-sky-950/30',      text: 'text-sky-700 dark:text-sky-300',     accent: 'bg-sky-100 dark:bg-sky-900/40' },
  'kitchenware-and-electronics': { bg: 'bg-violet-50 dark:bg-violet-950/30',text: 'text-violet-700 dark:text-violet-300',accent: 'bg-violet-100 dark:bg-violet-900/40' },
  'food-products':               { bg: 'bg-amber-50 dark:bg-amber-950/30',  text: 'text-amber-700 dark:text-amber-300', accent: 'bg-amber-100 dark:bg-amber-900/40' },
  'alcoholic-drinks':            { bg: 'bg-red-50 dark:bg-red-950/30',      text: 'text-red-700 dark:text-red-300',     accent: 'bg-red-100 dark:bg-red-900/40' },
  'general':                     { bg: 'bg-slate-50 dark:bg-slate-800',     text: 'text-slate-700 dark:text-slate-300', accent: 'bg-slate-100 dark:bg-slate-700' },
  'cleaning-and-sanitary':       { bg: 'bg-cyan-50 dark:bg-cyan-950/30',    text: 'text-cyan-700 dark:text-cyan-300',   accent: 'bg-cyan-100 dark:bg-cyan-900/40' },
  'kitchen-storage':             { bg: 'bg-orange-50 dark:bg-orange-950/30',text: 'text-orange-700 dark:text-orange-300',accent: 'bg-orange-100 dark:bg-orange-900/40' },
  'pet-care':                    { bg: 'bg-lime-50 dark:bg-lime-950/30',    text: 'text-lime-700 dark:text-lime-300',   accent: 'bg-lime-100 dark:bg-lime-900/40' },
};

export default function HomePage({ params: { locale }, searchParams }: HomePageProps) {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');
  const tCat = useTranslations('categories');
  const tSearch = useTranslations('search');
  const searchQuery = searchParams.search || '';
  const categoryFilter = searchParams.category || '';

  const heroSlides: HeroSlide[] = [
    {
      // Slide 1: Inside a modern supermarket — bright aisles, full shelves
      id: 'hero-main',
      badge: t('hero.slides.main.badge'),
      title: t('hero.slides.main.title'),
      subtitle: t('hero.slides.main.subtitle'),
      cta: t('hero.slides.main.cta'),
      href: `/${locale}/products`,
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1400&q=85',
      focus: 'center',
    },
    {
      // Slide 2: Vibrant fresh produce — colorful vegetables & fruits
      id: 'fresh-produce',
      badge: t('hero.slides.fresh.badge'),
      title: t('hero.slides.fresh.title'),
      subtitle: t('hero.slides.fresh.subtitle'),
      cta: t('hero.slides.fresh.cta'),
      href: `/${locale}/products?category=food-products`,
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&q=85',
      focus: 'center',
    },
    {
      // Slide 3: Happy shopper with cart — relatable, warm, human
      id: 'momo-pay',
      badge: t('hero.slides.momo.badge'),
      title: t('hero.slides.momo.title'),
      subtitle: t('hero.slides.momo.subtitle'),
      cta: t('hero.slides.momo.cta'),
      href: `/${locale}/checkout`,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=85',
      focus: 'center top',
    },
    {
      // Slide 4: Weekly deals — stacked grocery products, abundance feel
      id: 'deals',
      badge: t('hero.slides.deals.badge'),
      title: t('hero.slides.deals.title'),
      subtitle: t('hero.slides.deals.subtitle'),
      cta: t('hero.slides.deals.cta'),
      href: `/${locale}/products`,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=85',
      focus: 'center',
    },
  ];

  let displayProducts = searchQuery ? searchProducts(searchQuery) : products;
  if (categoryFilter) {
    displayProducts = displayProducts.filter(p => p.categorySlug === categoryFilter);
  }

  const isFiltered = searchQuery || categoryFilter;
  const featuredProducts = products.slice(0, 10);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {!isFiltered && <HeroBanner slides={heroSlides} interval={3500} />}

      {/* Trust Stats Bar - Dark Navy */}
      {!isFiltered && (
        <section className="bg-slate-900 py-4 overflow-hidden border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-around gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-simba-orange" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">15+ {t('yearsInRwanda')}</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-simba-orange" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">9 {t('branchesInKigali')}</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-simba-orange" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">789+ {t('products')}</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-simba-orange fill-simba-orange" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">4.8 {tNav('reviews')}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Shop by Category — full grid */}
      {!isFiltered && (
        <section className="py-14 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-simba-orange mb-1">{t('categories')}</p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('shopByCategory')}
                </h2>
              </div>
              <Link
                href={`/${locale}/products`}
                className="flex items-center gap-1.5 text-sm font-bold text-simba-orange hover:text-simba-orange-dark transition-colors"
              >
                {t('viewAll')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Category grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* All Products — featured wide card */}
              <Link
                href={`/${locale}/products`}
                className="group col-span-2 sm:col-span-3 lg:col-span-2 relative rounded-2xl overflow-hidden bg-simba-orange shadow-lg shadow-orange-200/50 dark:shadow-none hover:shadow-xl hover:shadow-orange-300/40 transition-all duration-300 hover:-translate-y-0.5 min-h-[140px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-simba-orange via-simba-orange to-simba-orange-dark" />
                <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full" />
                <div className="absolute -right-2 -bottom-10 w-24 h-24 bg-white/10 rounded-full" />
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-tight">{tNav('allProducts')}</p>
                    <p className="text-orange-100 text-xs font-semibold mt-0.5">{products.length} items</p>
                  </div>
                </div>
              </Link>

              {/* Individual category cards */}
              {categories.map((cat, i) => {
                const palette = CATEGORY_PALETTE[cat.slug] ?? { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-200', accent: 'bg-slate-200 dark:bg-slate-700' };
                return (
                  <Link
                    key={cat.id}
                    href={`/${locale}/products?category=${cat.slug}`}
                    className="group relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:border-simba-orange/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {/* Product image background */}
                    <div className="relative h-28 overflow-hidden bg-slate-50 dark:bg-slate-800">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {/* Count badge */}
                      <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {cat.productCount}
                      </div>
                    </div>
                    {/* Label */}
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-1">
                        {tCat(cat.slug as any)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Promo Rail - Latest Deals */}
      {!isFiltered && (
        <PromoRail 
          heading={t('weeklyDeals')}
          viewAllHref={`/${locale}/products`}
          viewAllLabel={t('viewAll')}
          cards={[
            {
              id: 'promo-1',
              title: t('promoFreshTitle'),
              subtitle: t('promoFreshSubtitle'),
              badge: t('promoFreshBadge'),
              image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
              href: `/${locale}/products?category=food-products`,
              cta: t('viewAll')
            },
            {
              id: 'promo-2',
              title: t('promoMomoTitle'),
              subtitle: t('promoMomoSubtitle'),
              badge: t('promoMomoBadge'),
              badgeColor: 'bg-blue-600 text-white',
              image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
              href: `/${locale}/checkout`,
              cta: t('startShopping')
            },
            {
              id: 'promo-3',
              title: t('promoBabyTitle'),
              subtitle: t('promoBabySubtitle'),
              badge: t('promoBabyBadge'),
              badgeColor: 'bg-red-600 text-white',
              image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
              href: `/${locale}/products?category=baby-products`,
              cta: t('viewAll')
            }
          ]}
        />
      )}

      {isFiltered && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {searchQuery
                ? `${tSearch('resultsFor', { query: searchQuery })}`
                : categories.find(c => c.slug === categoryFilter)?.name}
            </h1>
            <p className="text-slate-500 mt-1">{tSearch('productsFound', { count: displayProducts.length })}</p>
          </div>
          <ProductGrid products={displayProducts} locale={locale} />
        </div>
      )}

      {!isFiltered && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">
          
          {/* Featured Products Section */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                   <div className="w-8 h-1 bg-simba-orange rounded-full" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-simba-orange">{t('featured')}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {t('topPicks')}
                </h2>
                <p className="text-slate-500 mt-3 font-medium text-lg">{t('featuredSubtitle')}</p>
              </div>
              <Link href={`/${locale}/products`} className="hidden sm:flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-simba-orange dark:hover:bg-simba-orange dark:hover:text-white transition-all active:scale-95">
                {t('viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductGrid products={featuredProducts} locale={locale} />
            <Link href={`/${locale}/products`} className="sm:hidden flex items-center justify-center gap-2 mt-8 w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-sm active:scale-95">
              {t('viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.section>

          {/* Recently Viewed */}
          <div className="pt-10">
            <RecentlyViewed locale={locale} />
          </div>

          {/* Branch Experience & Reviews Section */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-12"
          >
            <div className="bg-orange-50 dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-orange-100 dark:border-slate-800 shadow-sm">
               <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1 text-center md:text-left">
                     <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                        <Star className="w-5 h-5 text-simba-orange fill-simba-orange" />
                        <span className="text-xs font-black uppercase tracking-widest text-simba-orange">{tNav('reviews')}</span>
                     </div>
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
                        {t('shareExperience')}
                     </h2>
                     <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg font-medium">
                        {t('shareExperienceDesc')}
                     </p>
                     <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <Link 
                           href={`/${locale}/branch-reviews`}
                           className="inline-flex items-center gap-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-simba-orange dark:hover:bg-simba-orange dark:hover:text-white transition-all active:scale-95 shadow-xl"
                        >
                           {t('browseBranchReviews')} <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link 
                           href={`/${locale}/locations`}
                           className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-bold hover:border-simba-orange border-2 border-transparent transition-all active:scale-95 shadow-sm"
                        >
                           <MapPin className="w-5 h-5 text-simba-orange" /> {tNav('storeLocator')}
                        </Link>
                     </div>
                  </div>
                  <div className="w-full md:w-1/3 grid grid-cols-2 gap-4">
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-slate-700">
                        <div className="text-2xl font-black text-simba-orange mb-1">4.8</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('avgRating')}</div>
                     </div>
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-slate-700">
                        <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">10k+</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalReviews')}</div>
                     </div>
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-slate-700">
                        <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">9</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('kigaliBranches')}</div>
                     </div>
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-slate-700 flex items-center justify-center">
                        <Star className="w-8 h-8 text-simba-orange fill-simba-orange" />
                     </div>
                  </div>
               </div>
            </div>
          </motion.section>

        </div>
      )}
    </div>
  );
}
