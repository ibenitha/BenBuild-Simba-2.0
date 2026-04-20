import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { categories, products, searchProducts } from '@/lib/products';
import ProductGrid from '@/components/products/ProductGrid';
import { ArrowRight, Truck, Shield, Clock, Star } from 'lucide-react';

interface HomePageProps {
  params: { locale: string };
  searchParams: { search?: string; category?: string };
}

export default function HomePage({ params: { locale }, searchParams }: HomePageProps) {
  const t = useTranslations('home');
  const searchQuery = searchParams.search || '';
  const categoryFilter = searchParams.category || '';

  // Filter products
  let displayProducts = searchQuery ? searchProducts(searchQuery) : products;
  if (categoryFilter) {
    displayProducts = displayProducts.filter(p => p.categorySlug === categoryFilter);
  }

  const isFiltered = searchQuery || categoryFilter;

  return (
    <div>
      {/* Hero Section */}
      {!isFiltered && (
        <section className="relative bg-gradient-to-br from-simba-green via-simba-green-dark to-green-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
                  🚚 {t('hero.badge')}
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  {t('hero.title')}
                </h1>
                <p className="text-lg text-green-100 mb-8 max-w-lg">
                  {t('hero.subtitle')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/${locale}?category=fresh-produce`}
                    className="bg-white text-simba-green px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg"
                  >
                    {t('hero.cta')}
                  </Link>
                  <Link
                    href={`/${locale}#categories`}
                    className="border-2 border-white/50 text-white px-8 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
                  >
                    Browse Categories
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mt-10">
                  {[
                    { label: 'Products', value: '789+' },
                    { label: 'Categories', value: '10' },
                    { label: 'Happy Customers', value: '50K+' },
                  ].map(stat => (
                    <div key={stat.label}>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-green-200 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero image grid */}
              <div className="hidden lg:grid grid-cols-2 gap-3">
                {[
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80',
                  'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80',
                  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&q=80',
                  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&q=80',
                ].map((img, i) => (
                  <div key={i} className={`relative rounded-2xl overflow-hidden ${i === 0 ? 'row-span-2 h-64' : 'h-[7.5rem]'}`}>
                    <Image src={img} alt="Product" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust badges */}
      {!isFiltered && (
        <section className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: <Truck className="w-5 h-5" />, title: 'Fast Delivery', desc: 'Same day in Kigali' },
                { icon: <Shield className="w-5 h-5" />, title: 'Secure Payment', desc: 'MoMo & Card' },
                { icon: <Clock className="w-5 h-5" />, title: '24/7 Support', desc: 'Always here for you' },
                { icon: <Star className="w-5 h-5" />, title: 'Quality Guarantee', desc: 'Fresh or refunded' },
              ].map(item => (
                <div key={item.title} className="flex items-center gap-3 py-2">
                  <div className="text-simba-green">{item.icon}</div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search results header */}
        {isFiltered && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {searchQuery ? `Results for "${searchQuery}"` : categories.find(c => c.slug === categoryFilter)?.name}
            </h1>
            <p className="text-slate-500 mt-1">{displayProducts.length} products found</p>
          </div>
        )}

        {/* Categories */}
        {!isFiltered && (
          <section id="categories" className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('categories')}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/${locale}/category/${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm">{cat.name}</p>
                    <p className="text-white/70 text-xs">{cat.productCount} items</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {isFiltered ? '' : t('featured')}
            </h2>
            {!isFiltered && (
              <Link href={`/${locale}?search=`} className="text-simba-green text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          <ProductGrid products={displayProducts} locale={locale} />
        </section>
      </div>
    </div>
  );
}