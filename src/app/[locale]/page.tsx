'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { categories, products, searchProducts } from '@/lib/products';
import { simbaBranches } from '@/lib/branches';
import ProductGrid from '@/components/products/ProductGrid';
import { Reveal, staggerContainer, fadeIn } from '@/lib/animations';
import RecentlyViewed from '@/components/products/RecentlyViewed';
import ConversationalSearch from '@/components/products/ConversationalSearch';
import HeroBanner, { HeroSlide } from '@/components/products/HeroBanner';
import { ArrowRight, Truck, Zap, MapPin, ShieldCheck, Star, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';

interface HomePageProps {
  params: { locale: string };
  searchParams: { search?: string; category?: string };
}

export default function HomePage({ params: { locale }, searchParams }: HomePageProps) {
  const t = useTranslations('home');
  const tSearch = useTranslations('search');
  const searchQuery = searchParams.search || '';
  const categoryFilter = searchParams.category || '';

  const heroSlides: HeroSlide[] = [
    {
      id: 'hero-main',
      badge: "Rwanda's #1 Supermarket",
      title: 'Fresh Groceries, Delivered in 45 min',
      subtitle: 'Shop 789+ products from 9 Kigali branches. Pick up in-store or get it delivered today.',
      cta: 'Start Shopping',
      href: `/${locale}/category/food-products`,
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&q=85',
      focus: 'center',
    },
    {
      id: 'fresh-produce',
      badge: 'Farm fresh daily',
      title: 'Fresh Vegetables & Fruits',
      subtitle: 'Sourced fresh every morning. Tomatoes, avocados, bananas and more — delivered to your door.',
      cta: 'Shop Produce',
      href: `/${locale}/category/vegetables-fruits`,
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1400&q=85',
      focus: 'center',
    },
    {
      id: 'momo-pay',
      badge: 'Easy checkout',
      title: 'Pay with MoMo, Pick Up Fast',
      subtitle: 'Confirm your order with a 500 RWF deposit. Your branch starts preparing immediately.',
      cta: 'Order Now',
      href: `/${locale}/checkout`,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=85',
      focus: 'center',
    },
  ];

  // Filter products
  let displayProducts = searchQuery ? searchProducts(searchQuery) : products;
  if (categoryFilter) {
    displayProducts = displayProducts.filter(p => p.categorySlug === categoryFilter);
  }

  const isFiltered = searchQuery || categoryFilter;
  const featuredProducts = products.slice(0, 8);
  const bestSellers = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 4);
  const newArrivals = [...products].reverse().slice(0, 4);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">

      {/* ════════════════════════════════════════
          HERO BANNER — auto-sliding, full-bleed
      ════════════════════════════════════════ */}
      {!isFiltered && <HeroBanner slides={heroSlides} />}

      {/* ════════════════════════════════════════
          VALUE PROPS STRIP
      ════════════════════════════════════════ */}
      {!isFiltered && (
        <div className="bg-simba-orange">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-orange-400/50">
              {[
                { icon: <Zap className="w-5 h-5" />,        title: '45-min delivery',  desc: 'In Kigali' },
                { icon: <Truck className="w-5 h-5" />,       title: 'Free pick-up',     desc: 'At 9 branches' },
                { icon: <ShieldCheck className="w-5 h-5" />, title: 'MoMo & Card',      desc: 'Secure payment' },
                { icon: <Star className="w-5 h-5" />,        title: 'Fresh guarantee',  desc: 'Or we refund' },
              ].map(item => (
                <div key={item.title} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="text-white/80 flex-shrink-0">{item.icon}</div>
                  <div>
                    <p className="font-bold text-sm text-white leading-tight">{item.title}</p>
                    <p className="text-xs text-orange-100">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SEARCH / FILTERED RESULTS
      ════════════════════════════════════════ */}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ════════════════════════════════════════
              SHOP BY CATEGORY
          ════════════════════════════════════════ */}
          <section className="py-12 sm:py-16">
            <Reveal>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t('categories')}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{t('categoriesSubtitle')}</p>
                </div>
                <Link
                  href={`/${locale}/category/food-products`}
                  className="flex items-center gap-1.5 text-sm font-bold text-simba-orange hover:text-simba-orange-dark transition-all group"
                >
                  View All Categories <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              {categories.map(cat => (
                <div key={cat.id}>
                  <Link
                    href={`/${locale}/category/${cat.slug}`}
                    className="group relative block rounded-[32px] overflow-hidden aspect-[4/5] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 dark:border-slate-800"
                  >
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-white font-black text-lg leading-tight">{cat.name}</p>
                      <p className="text-white/60 text-xs mt-1 font-bold uppercase tracking-widest">{cat.productCount} items</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════
              BEST SELLERS & NEW ARRIVALS
          ════════════════════════════════════════ */}
          <section className="py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-simba-orange" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Best Sellers</h3>
              </div>
              <ProductGrid products={bestSellers} locale={locale} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">New Arrivals</h3>
              </div>
              <ProductGrid products={newArrivals} locale={locale} />
            </div>
          </section>

          {/* ════════════════════════════════════════
              AI CONVERSATIONAL SEARCH
          ════════════════════════════════════════ */}
          <section className="py-12">
            <ConversationalSearch locale={locale} />
          </section>

          {/* ════════════════════════════════════════
              FEATURED PRODUCTS
          ════════════════════════════════════════ */}
          <section className="py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('featured')}
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">{t('featuredSubtitle')}</p>
              </div>
              <Link
                href={`/${locale}/category/food-products`}
                className="flex items-center gap-1.5 text-sm font-bold text-simba-orange hover:text-simba-orange-dark transition-all group"
              >
                {t('viewAll')} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ProductGrid products={featuredProducts} locale={locale} />
          </section>

          {/* ════════════════════════════════════════
              TRUST SIGNALS
          ════════════════════════════════════════ */}
          <section className="py-12">
            <div className="rounded-[48px] bg-simba-navy overflow-hidden shadow-2xl">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10 border-b border-white/10">
                {[
                  { value: '9',    label: t('kigaliBranches') },
                  { value: '789+', label: t('products') },
                  { value: '45min', label: t('avgDelivery') },
                  { value: '10K+', label: t('happyCustomers') },
                ].map(stat => (
                  <div key={stat.label} className="py-8 text-center">
                    <p className="text-3xl sm:text-4xl font-black text-simba-orange tracking-tighter">{stat.value}</p>
                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Branch locations */}
              <div className="px-8 sm:px-12 py-8">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-simba-orange flex-shrink-0" />
                  <p className="text-sm font-black text-white uppercase tracking-widest">{t('ourBranches')}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {simbaBranches.map(branch => (
                    <Link
                      key={branch.id}
                      href={`/${locale}/checkout`}
                      className="text-xs bg-white/5 hover:bg-simba-orange text-white/70 hover:text-white px-4 py-2 rounded-xl transition-all border border-white/10 hover:border-simba-orange font-bold"
                    >
                      {branch.name.replace('Simba Supermarket ', '')}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              BOTTOM CTA BANNER
          ════════════════════════════════════════ */}
          <section className="py-12 pb-24">
            <div className="relative rounded-[48px] overflow-hidden bg-gradient-to-br from-simba-orange to-orange-600 p-10 sm:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-orange-900/20">
              <div className="text-center lg:text-left max-w-xl">
                <h3 className="text-3xl sm:text-5xl font-black text-white leading-[1.1] tracking-tight">
                  {t('readyToCta')}
                </h3>
                <p className="text-orange-50 mt-4 text-base sm:text-lg font-medium opacity-90">
                  {t('readyToCtaDesc')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0 w-full sm:w-auto">
                <Link
                  href={`/${locale}/category/food-products`}
                  className="inline-flex items-center justify-center gap-2 bg-white text-simba-orange font-black text-base px-10 py-5 rounded-2xl hover:bg-orange-50 transition-all shadow-xl active:scale-95"
                >
                  {t('startShopping')} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href={`/${locale}/checkout`}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-black text-base px-10 py-5 rounded-2xl border border-white/20 transition-all backdrop-blur-sm active:scale-95"
                >
                  {t('chooseBranch')}
                </Link>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              RECENTLY VIEWED
          ════════════════════════════════════════ */}
          <div className="pb-24">
            <RecentlyViewed locale={locale} />
          </div>

        </div>
      )}
    </div>
  );
}
