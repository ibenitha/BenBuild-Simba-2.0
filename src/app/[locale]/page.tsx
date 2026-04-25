'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { categories, products, searchProducts } from '@/lib/products';
import { simbaBranches } from '@/lib/branches';
import ProductGrid from '@/components/products/ProductGrid';
import RecentlyViewed from '@/components/products/RecentlyViewed';
import ConversationalSearch from '@/components/products/ConversationalSearch';
import HeroBanner, { HeroSlide } from '@/components/products/HeroBanner';
import { ArrowRight, Truck, Zap, MapPin, ShieldCheck, Star, ChevronRight, Clock, Tag } from 'lucide-react';

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
      subtitle: 'Sourced fresh every morning. Tomatoes, avocados, bananas and more.',
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
    {
      id: 'deals',
      badge: 'Limited offer',
      title: '15% Off All Groceries',
      subtitle: 'Use code SIMBA10 at checkout. Fresh picks, unbeatable prices across all categories.',
      cta: 'Claim Offer',
      href: `/${locale}/category/food-products`,
      image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1400&q=85',
      focus: 'center',
    },
  ];

  let displayProducts = searchQuery ? searchProducts(searchQuery) : products;
  if (categoryFilter) {
    displayProducts = displayProducts.filter(p => p.categorySlug === categoryFilter);
  }

  const isFiltered = searchQuery || categoryFilter;
  const featuredProducts = products.slice(0, 10);
  const dealsProducts = products.filter(p => p.originalPrice).slice(0, 5);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">

      {/* HERO */}
      {!isFiltered && <HeroBanner slides={heroSlides} />}

      {/* VALUE PROPS STRIP */}
      {!isFiltered && (
        <div className="bg-simba-orange">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-orange-400/50">
              {[
                { icon: <Zap className="w-4 h-4" />, title: '45-min delivery', desc: 'In Kigali' },
                { icon: <Truck className="w-4 h-4" />, title: 'Free pick-up', desc: 'At 9 branches' },
                { icon: <ShieldCheck className="w-4 h-4" />, title: 'MoMo & Card', desc: 'Secure payment' },
                { icon: <Star className="w-4 h-4" />, title: 'Fresh guarantee', desc: 'Or we refund' },
              ].map(item => (
                <div key={item.title} className="flex items-center gap-2.5 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white leading-tight">{item.title}</p>
                    <p className="text-[11px] text-orange-100">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH / FILTERED RESULTS */}
      {isFiltered && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {searchQuery
                ? tSearch('resultsFor', { query: searchQuery })
                : categories.find(c => c.slug === categoryFilter)?.name}
            </h1>
            <p className="text-slate-500 mt-1">{tSearch('productsFound', { count: displayProducts.length })}</p>
          </div>
          <ProductGrid products={displayProducts} locale={locale} />
        </div>
      )}

      {!isFiltered && (
        <>
          {/* CATEGORIES */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t('categories')}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">{t('categoriesSubtitle')}</p>
              </div>
              <Link
                href={`/${locale}/category/food-products`}
                className="flex items-center gap-1 text-sm font-semibold text-simba-orange hover:text-simba-orange-dark transition-colors"
              >
                {t('viewAll')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/${locale}/category/${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
                  style={{ aspectRatio: '4/3' }}
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-simba-orange/0 group-hover:bg-simba-orange/15 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight">{cat.name}</p>
                    <p className="text-white/60 text-[11px] mt-0.5">{cat.productCount} items</p>
                  </div>
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                    <ArrowRight className="w-3 h-3 text-simba-orange" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* TODAY&apos;S DEALS STRIP */}
          {dealsProducts.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-5 sm:p-6 overflow-hidden relative">
                <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
                  <div className="w-64 h-64 rounded-full bg-white absolute -right-16 -top-16" />
                  <div className="w-40 h-40 rounded-full bg-white absolute right-8 top-16" />
                </div>
                <div className="flex items-center justify-between mb-4 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-white text-lg leading-tight">{t('deals')}</h2>
                      <p className="text-red-100 text-xs">Limited time offers</p>
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/category/food-products`}
                    className="flex items-center gap-1 text-sm font-bold text-white/90 hover:text-white transition-colors bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg"
                  >
                    {t('viewAll')} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide relative">
                  {dealsProducts.map(product => {
                    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
                    return (
                      <Link
                        key={product.id}
                        href={`/${locale}/products/${product.id}`}
                        className="flex-shrink-0 w-36 sm:w-40 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group"
                      >
                        <div className="relative h-28">
                          <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                            -{discount}%
                          </div>
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">{product.name}</p>
                          <p className="text-sm font-black text-simba-orange mt-1">{product.price.toLocaleString()} RWF</p>
                          <p className="text-[10px] text-slate-400 line-through">{product.originalPrice?.toLocaleString()} RWF</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TRUST STATS + BRANCHES */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="rounded-2xl bg-simba-navy overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10 border-b border-white/10">
                {[
                  { value: '9', label: t('kigaliBranches'), icon: <MapPin className="w-4 h-4" /> },
                  { value: '789+', label: t('products'), icon: <Tag className="w-4 h-4" /> },
                  { value: '45min', label: t('avgDelivery'), icon: <Clock className="w-4 h-4" /> },
                  { value: '10K+', label: t('happyCustomers'), icon: <Star className="w-4 h-4" /> },
                ].map(stat => (
                  <div key={stat.label} className="py-5 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="text-simba-orange/60">{stat.icon}</span>
                      <p className="text-2xl sm:text-3xl font-black text-simba-orange">{stat.value}</p>
                    </div>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 sm:px-8 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-simba-orange flex-shrink-0" />
                  <p className="text-sm font-bold text-white">{t('ourBranches')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {simbaBranches.map(branch => (
                    <Link
                      key={branch.id}
                      href={`/${locale}/checkout`}
                      className="text-xs bg-white/10 hover:bg-simba-orange/80 text-white/80 hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 border border-white/10 hover:border-simba-orange hover:scale-105"
                    >
                      {branch.name.replace('Simba Supermarket ', '')}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI SEARCH */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <ConversationalSearch locale={locale} />
          </div>

          {/* FEATURED PRODUCTS */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t('featured')}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">{t('featuredSubtitle')}</p>
              </div>
              <Link
                href={`/${locale}/category/food-products`}
                className="flex items-center gap-1 text-sm font-semibold text-simba-orange hover:text-simba-orange-dark transition-colors"
              >
                {t('viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductGrid products={featuredProducts} locale={locale} />
          </div>

          {/* BOTTOM CTA */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80"
                  alt="Fresh groceries"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent" />
              </div>
              <div className="relative px-8 sm:px-12 py-12 sm:py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                <div className="max-w-lg">
                  <p className="text-simba-orange text-sm font-bold uppercase tracking-widest mb-2">Ready to order?</p>
                  <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                    {t('readyToCta')}
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {t('readyToCtaDesc')}
                  </p>
                </div>
                <div className="flex flex-col gap-3 flex-shrink-0 w-full sm:w-auto">
                  <Link
                    href={`/${locale}/category/food-products`}
                    className="inline-flex items-center justify-center gap-2 bg-simba-orange hover:bg-simba-orange-dark text-white font-black text-sm px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/30"
                  >
                    {t('startShopping')} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/${locale}/checkout`}
                    className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-8 py-4 rounded-xl border border-white/20 transition-all hover:border-white/40"
                  >
                    <MapPin className="w-4 h-4" />
                    {t('chooseBranch')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RECENTLY VIEWED */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <RecentlyViewed locale={locale} />
          </div>
        </>
      )}
    </div>
  );
}
