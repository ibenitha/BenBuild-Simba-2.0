import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { categories, products, searchProducts } from '@/lib/products';
import { simbaBranches } from '@/lib/branches';
import ProductGrid from '@/components/products/ProductGrid';
import RecentlyViewed from '@/components/products/RecentlyViewed';
import ConversationalSearch from '@/components/products/ConversationalSearch';
import HeroBanner, { HeroSlide } from '@/components/products/HeroBanner';
import { ArrowRight, Truck, Zap, MapPin, ShieldCheck, Star, ChevronRight } from 'lucide-react';

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

  // Filter products
  let displayProducts = searchQuery ? searchProducts(searchQuery) : products;
  if (categoryFilter) {
    displayProducts = displayProducts.filter(p => p.categorySlug === categoryFilter);
  }

  const isFiltered = searchQuery || categoryFilter;
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">

      {/* ════════════════════════════════════════
          HERO BANNER — auto-sliding, full-bleed
      ════════════════════════════════════════ */}
      {!isFiltered && <HeroBanner slides={heroSlides} />}

      {/* ════════════════════════════════════════
          VALUE PROPS STRIP
          Answers: "Why should I use this?"
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
              Gives users a reason to scroll
          ════════════════════════════════════════ */}
          <section className="py-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
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
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight">{cat.name}</p>
                    <p className="text-white/70 text-xs mt-0.5">{cat.productCount} items</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════
              TRUST SIGNALS — stats + branches
              "This is Simba. I can trust it."
          ════════════════════════════════════════ */}
          <section className="py-2 pb-10">
            <div className="rounded-2xl bg-simba-navy overflow-hidden">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10 border-b border-white/10">
                {[
                  { value: '9',    label: t('kigaliBranches') },
                  { value: '789+', label: t('products') },
                  { value: '45min', label: t('avgDelivery') },
                  { value: '10K+', label: t('happyCustomers') },
                ].map(stat => (
                  <div key={stat.label} className="py-5 text-center">
                    <p className="text-2xl sm:text-3xl font-black text-simba-orange">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Branch locations */}
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
                      className="text-xs bg-white/10 hover:bg-simba-orange/80 text-white/80 hover:text-white px-3 py-1.5 rounded-full transition-colors border border-white/10 hover:border-simba-orange"
                    >
                      {branch.name.replace('Simba Supermarket ', '')}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              AI CONVERSATIONAL SEARCH
          ════════════════════════════════════════ */}
          <section className="pb-10">
            <ConversationalSearch locale={locale} />
          </section>

          {/* ════════════════════════════════════════
              FEATURED PRODUCTS
          ════════════════════════════════════════ */}
          <section className="pb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
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
          </section>

          {/* ════════════════════════════════════════
              BOTTOM CTA BANNER
              One final push to convert
          ════════════════════════════════════════ */}
          <section className="pb-12">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-simba-orange to-orange-400 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {t('readyToCta')}
                </h3>
                <p className="text-orange-100 mt-2 text-sm sm:text-base">
                  {t('readyToCtaDesc')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  href={`/${locale}/category/food-products`}
                  className="inline-flex items-center justify-center gap-2 bg-white text-simba-orange font-black text-sm px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-md"
                >
                  {t('startShopping')} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/${locale}/checkout`}
                  className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-6 py-3 rounded-xl border border-white/30 transition-colors"
                >
                  {t('chooseBranch')}
                </Link>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              RECENTLY VIEWED
          ════════════════════════════════════════ */}
          <div className="pb-12">
            <RecentlyViewed locale={locale} />
          </div>

        </div>
      )}
    </div>
  );
}
