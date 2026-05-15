'use client';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getCategoryBySlug, getProductsByCategory, categories as allCategories } from '@/lib/products';
import ProductGrid from '@/components/products/ProductGrid';
import FilterSidebar from '@/components/products/FilterSidebar';
import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface CategoryPageProps {
  params: { locale: string; slug: string };
}

export default function CategoryPage({ params: { locale, slug } }: CategoryPageProps) {
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const t = useTranslations('product');
  const products = getProductsByCategory(slug);
  const [filters, setFilters] = useState({ categories: [] as string[], priceRange: [0, 1000000] as [number, number], inStockOnly: false });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesPrice = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];
      const matchesStock = filters.inStockOnly ? p.inStock : true;
      return matchesPrice && matchesStock;
    });
  }, [products, filters]);

  const categoryNames = useMemo(() => allCategories.map(c => c.name), []);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Category header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            <Link href={`/${locale}`} className="hover:text-simba-orange transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 dark:text-slate-200">{category.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                <Image src={category.image} alt={category.name} fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100">{category.name}</h1>
                <p className="text-slate-500 mt-1 font-medium">
                  {t('productsAvailable', { count: filteredProducts.length })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <FilterSidebar
              categories={categoryNames}
              onFilterChange={setFilters}
            />
          </aside>

          <main className="flex-1">
            <ProductGrid
              products={filteredProducts}
              locale={locale}
              emptyMessage={t('noProductsIn', { category: category.name })}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
