'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { categories, products, searchProducts } from '@/lib/products';
import ProductGrid from '@/components/products/ProductGrid';
import { LayoutGrid, ChevronDown, Search, X, Home, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface ProductsPageProps {
  params: { locale: string };
}

// Emoji icons per category slug
const CATEGORY_EMOJI: Record<string, string> = {
  'cosmetics-and-personal-care': '💄',
  'sports-and-wellness':         '🏃',
  'baby-products':               '🍼',
  'kitchenware-and-electronics': '🍳',
  'food-products':               '🛒',
  'alcoholic-drinks':            '🍷',
  'general':                     '📦',
  'cleaning-and-sanitary':       '🧹',
  'kitchen-storage':             '🗄️',
  'pet-care':                    '🐾',
};

export default function ProductsPage({ params: { locale } }: ProductsPageProps) {
  const t = useTranslations('product');
  const tNav = useTranslations('nav');
  const tCat = useTranslations('categories');
  const tSearch = useTranslations('search');
  const tFilter = useTranslations('filter');
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';
  const aiIdsParam = searchParams.get('aiIds') || '';
  const aiQuery = searchParams.get('q') || '';

  // Product IDs pinned from AI chat
  const aiPinnedIds = useMemo(
    () => aiIdsParam ? aiIdsParam.split(',').filter(Boolean) : [],
    [aiIdsParam]
  );
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // New filters state
  const [maxPrice, setMaxPrice] = useState(100000);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(20);

  // Update selected category when URL changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else if (!searchQuery && !aiIdsParam) {
      setSelectedCategory('all');
    }
    // Reset pagination when filters change
    setVisibleCount(20);
  }, [categoryParam, searchQuery, aiIdsParam]);

  // Reset pagination when other filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedCategory, maxPrice, inStockOnly, sortBy]);

  // Memoized filtered products
  const displayProducts = useMemo(() => {
    // AI mode: pin AI products first, then fill with related
    if (aiPinnedIds.length > 0) {
      const aiProducts = aiPinnedIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean) as typeof products;

      // Related: text search on the query, excluding already-pinned IDs
      const related = aiQuery
        ? searchProducts(aiQuery).filter(p => !aiPinnedIds.includes(p.id))
        : products.filter(p => !aiPinnedIds.includes(p.id));

      return [...aiProducts, ...related];
    }

    let filtered = searchQuery ? searchProducts(searchQuery) : products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categorySlug === selectedCategory);
    }

    filtered = filtered.filter(p => p.price <= maxPrice);

    if (inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }

    return filtered;
  }, [selectedCategory, searchQuery, maxPrice, inStockOnly, aiPinnedIds, aiQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...displayProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [displayProducts, sortBy]);

  const pagedProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleCount);
  }, [sortedProducts, visibleCount]);

  const hasMore = visibleCount < sortedProducts.length;

  const selectedCategoryName = selectedCategory === 'all' 
    ? tNav('allProducts')
    : tCat(selectedCategory as any);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-simba-orange transition-colors">
            <Home className="w-3.5 h-3.5" />
            {tNav('home')}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/${locale}/products`} className={`hover:text-simba-orange transition-colors ${selectedCategory === 'all' && !searchQuery ? 'text-simba-orange' : ''}`}>
            {tNav('allProducts')}
          </Link>
          {selectedCategory !== 'all' && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-simba-orange">{selectedCategoryName}</span>
            </>
          )}
          {searchQuery && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-simba-orange">&quot;{searchQuery}&quot;</span>
            </>
          )}
        </nav>

        {/* Mobile Category Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden w-full mb-4 flex items-center justify-between gap-2 bg-simba-orange text-white px-4 py-3 rounded-xl font-bold"
        >
          <span className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            {tNav('categories')} & {tFilter('title')}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Categories & Filters */}
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0 space-y-6`}>
            {/* Categories Menu — light theme */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              {/* Header */}
              <div className="px-4 pt-4 pb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  {tNav('categories')}
                </h2>
              </div>

              <div className="px-3 pb-3 space-y-0.5 max-h-[480px] overflow-y-auto custom-scrollbar">
                {/* All Products pill */}
                <Link
                  href={`/${locale}/products`}
                  onClick={() => { setSelectedCategory('all'); setSidebarOpen(false); }}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-simba-orange text-white shadow-md shadow-orange-200 dark:shadow-none'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{tNav('allProducts')}</span>
                  <span className={`text-xs font-semibold ${selectedCategory === 'all' ? 'text-white/80' : 'text-slate-400'}`}>
                    ({products.length})
                  </span>
                </Link>

                {/* Individual Categories */}
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/${locale}/products?category=${cat.slug}`}
                    onClick={() => { setSelectedCategory(cat.slug); setSidebarOpen(false); }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm transition-all ${
                      selectedCategory === cat.slug
                        ? 'bg-orange-50 dark:bg-orange-950/30 text-simba-orange font-bold'
                        : 'text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{CATEGORY_EMOJI[cat.slug] ?? '🛒'}</span>
                      {tCat(cat.slug as any)}
                    </span>
                    <span className={`text-xs font-semibold ${selectedCategory === cat.slug ? 'text-simba-orange' : 'text-slate-400'}`}>
                      ({cat.productCount})
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Additional Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                <SlidersHorizontal className="w-4 h-4 text-simba-orange" />
                <h3 className="font-bold text-sm uppercase tracking-tight">{tFilter('title')}</h3>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tFilter('price')}</label>
                  <span className="text-xs font-bold text-simba-orange bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-lg">
                    ≤ {maxPrice.toLocaleString()} RWF
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-simba-orange"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>0 RWF</span>
                  <span>100,000 RWF</span>
                </div>
              </div>

              {/* Stock Filter */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-200 dark:border-slate-700 transition-all checked:bg-simba-orange checked:border-simba-orange"
                    />
                    <svg
                      className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight group-hover:text-simba-orange transition-colors">
                    {tFilter('inStock')}
                  </span>
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setMaxPrice(100000);
                  setInStockOnly(false);
                }}
                className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-simba-orange border border-dashed border-slate-200 dark:border-slate-800 hover:border-simba-orange rounded-xl transition-all"
              >
                {tFilter('clear')}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* AI Results Banner */}
            {aiPinnedIds.length > 0 && (
              <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 rounded-xl border border-orange-200 dark:border-orange-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-simba-orange flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Simba AI found {aiPinnedIds.length} match{aiPinnedIds.length !== 1 ? 'es' : ''}{aiQuery ? ` for "${aiQuery}"` : ''}
                    </p>
                    <p className="text-xs text-slate-500">Showing AI picks first, followed by related products</p>
                  </div>
                </div>
                <Link
                  href={`/${locale}/products`}
                  className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-lg transition-colors text-simba-orange"
                >
                  <X className="w-4 h-4" />
                </Link>
              </div>
            )}

            {searchQuery && (
              <div className="mb-6 flex items-center justify-between bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/50">
                <div className="flex items-center gap-3 text-simba-orange">
                  <Search className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-tight">
                    {tSearch('resultsFor', { query: searchQuery })}
                  </span>
                </div>
                <Link 
                  href={`/${locale}/products`}
                  className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-lg transition-colors text-simba-orange"
                >
                  <X className="w-5 h-5" />
                </Link>
              </div>
            )}

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  {aiPinnedIds.length > 0
                    ? (aiQuery ? `Results for "${aiQuery}"` : 'Simba AI Results')
                    : selectedCategoryName}
                  <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">({sortedProducts.length} {tNav('itemsLabel', { count: sortedProducts.length })})</span>
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sortBy')}:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-simba-orange transition-colors"
                >
                  <option value="newest">{t('sortOptions.newest')}</option>
                  <option value="price-low">{t('sortOptions.priceLow')}</option>
                  <option value="price-high">{t('sortOptions.priceHigh')}</option>
                  <option value="name">{t('sortOptions.name')}</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {pagedProducts.length > 0 ? (
              <div className="space-y-10">
                <ProductGrid products={pagedProducts} locale={locale} />
                
                {hasMore && (
                  <div className="flex justify-center pb-8">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 20)}
                      className="px-12 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:border-simba-orange hover:text-simba-orange transition-all shadow-sm active:scale-95"
                    >
                      {tNav('more')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-16 text-center border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('noMatchesFound')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto text-sm font-medium leading-relaxed">
                  {t('noMatchesDesc', { query: searchQuery || selectedCategoryName })}
                </p>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setMaxPrice(100000);
                    setInStockOnly(false);
                  }}
                  className="mt-8 px-8 py-3 bg-simba-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                >
                  {t('browseAll')}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
