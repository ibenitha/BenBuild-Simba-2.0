'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { ShoppingCart, Search, Sun, Moon, Menu, X, Globe, ChevronDown, LayoutGrid, Heart, Phone, MapPin, Check, Clock, ChevronRight, Star, MessageSquare } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useBranchStore } from '@/store/branch';
import { useOperationsStore } from '@/store/operations';
import { simbaBranches } from '@/lib/branches';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { categories, products, searchProducts } from '@/lib/products';
import { useAuthStore } from '@/store/auth';
import dynamic from 'next/dynamic';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';


const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), {
  ssr: false,
});

interface NavbarProps {
  locale: string;
}

export default function Navbar({ locale }: NavbarProps) {
  return (
    <Suspense fallback={null}>
      <NavbarInner locale={locale} />
    </Suspense>
  );
}

function NavbarInner({ locale }: NavbarProps) {
  const t = useTranslations('nav');
  const tCat = useTranslations('categories');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  
  const itemCount = useCartStore(s => s.itemCount());
  const { selectedBranchId, setBranchId, getSelectedBranch } = useBranchStore();
  const { reviews, fetchReviews } = useOperationsStore();
  const currentBranch = getSelectedBranch();

  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (!mounted) return;

    // Check if branch was ever selected or if specifically requested via URL
    const stored = localStorage.getItem('simba-branch-selection');
    const triggerModal = searchParams.get('changeBranch') === 'true';

    if (!stored || triggerModal) {
      setShowBranchModal(true);
    }
  }, [searchParams, mounted]);
  // Branch ratings calculation
  const branchRatings = useMemo(() =>
    simbaBranches.reduce<Record<string, { avg: number; count: number }>>((acc, b) => {
      const br = reviews.filter(r => r.branchId === b.id);
      acc[b.id] = {
        avg: br.length ? br.reduce((s, r) => s + r.rating, 0) / br.length : 0,
        count: br.length,
      };
      return acc;
    }, {}),
    [reviews]
  );

  // Handle live search suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results = searchProducts(searchQuery).slice(0, 5);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
      setShowSuggestions(false);
    }
  };

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setLangOpen(false);
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  ];

  return (
    <>
      {/* Top info bar */}
      <div className="bg-simba-navy dark:bg-slate-950 text-white text-xs py-2 hidden sm:block relative z-[200]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +250 788 000 000</span>
            <span>📧 info@simbasupermarket.rw</span>
          </div>
          <div className="flex items-center gap-4">
            <span>🚚 {t('freeDelivery')}</span>
            {/* Social icons — compact */}
            <div className="hidden lg:flex items-center gap-2 border-l border-white/10 pl-4">
              <a href="https://facebook.com/SimbaRwanda" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/60 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com/simbarwanda" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/60 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://x.com/SimbaRwanda" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="text-white/60 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
            <div className="relative">
              <button
                onClick={() => setBranchOpen(!branchOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-simba-orange" />
                <span className="font-medium">
                  {mounted ? currentBranch?.name.replace('Simba Supermarket ', '') : '...'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${branchOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {branchOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 min-w-[200px] z-[200] overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Branch</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {simbaBranches.map(branch => (
                      <button
                        key={branch.id}
                        onClick={() => {
                          setBranchId(branch.id);
                          setBranchOpen(false);
                          window.location.reload(); // Reload to refresh all stock data
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors ${selectedBranchId === branch.id ? 'text-simba-orange font-bold bg-orange-50/50 dark:bg-orange-950/20' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        <span>{branch.name.replace('Simba Supermarket ', '')}</span>
                        {selectedBranchId === branch.id && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-100 dark:border-slate-800">
        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16 sm:h-20">
            {/* Logo — Simba lion brand */}
            <Link href={`/${locale}`} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <Image
                  src="/simba-logo.png"
                  alt="Simba Supermarket"
                  fill
                  className="object-contain"
                  sizes="48px"
                  priority
                />
              </div>
              <div>
                <span className="font-black text-xl sm:text-2xl text-simba-orange tracking-tight leading-none block">SIMBA</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-widest uppercase block">Supermarket</span>
              </div>
            </Link>

            {/* Search bar */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-2xl relative">
              <form onSubmit={handleSearch} className="w-full flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                  placeholder={t('search')}
                  className="w-full pl-5 pr-4 py-3 rounded-l-xl border-2 border-r-0 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange transition-all"
                />
                <button
                  type="submit"
                  className="bg-simba-orange hover:bg-simba-orange-dark text-white px-6 rounded-r-xl flex items-center gap-2 font-medium text-sm transition-colors flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden lg:inline">{t('searchCta')}</span>
                </button>
              </form>

              {/* Live Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[60]">
                  <div className="py-2">
                    {suggestions.map(product => (
                      <Link
                        key={product.id}
                        href={`/${locale}/products/${product.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{product.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-simba-orange">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={handleSearch}
                      className="w-full py-3 px-4 text-sm font-bold text-simba-orange hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-center border-t border-slate-100 dark:border-slate-700"
                    >
                      {t('seeAllResults', { query: searchQuery })}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0">
              {/* Language */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="uppercase font-semibold text-xs">{locale}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 min-w-[160px] z-50">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors ${locale === lang.code ? 'text-simba-orange font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        <span>{lang.flag}</span> {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label={t('toggleDarkMode')}
                >
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              )}

              {/* Wishlist */}
              <button className="hidden sm:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Heart className="w-5 h-5" />
              </button>

              {currentUser ? (
                <>
                  <div className="relative hidden sm:block group">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-simba-orange transition-colors text-sm">
                      <div className="w-6 h-6 rounded-full bg-simba-orange text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                        {currentUser.fullName?.charAt(0)?.toUpperCase() || currentUser.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 max-w-[80px] truncate">
                        {currentUser.fullName?.split(' ')[0] || 'Account'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 min-w-[180px] z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.fullName || currentUser.email}</p>
                        <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                        {currentUser.role !== 'customer' && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-simba-orange/10 text-simba-orange text-[9px] font-black uppercase tracking-widest rounded-full">
                            {currentUser.role}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/${locale}/profile`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        href={`/${locale}/orders`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        My Orders
                      </Link>
                      {(currentUser.role === 'staff' || currentUser.role === 'manager' || currentUser.role === 'admin') && (
                        <Link
                          href={`/${locale}/branch-dashboard`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Branch Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => logout()}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-slate-100 dark:border-slate-700 mt-1"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={`/${locale}/auth/login`}
                  className="hidden sm:block px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:border-simba-orange font-semibold text-slate-600 dark:text-slate-300 hover:text-simba-orange transition-colors"
                >
                  {t('login')}
                </Link>
              )}

              {/* Branch Ops — only show for staff/manager/admin */}
              {currentUser && (currentUser.role === 'staff' || currentUser.role === 'manager' || currentUser.role === 'admin') && (
                <Link
                  href={`/${locale}/branch-dashboard`}
                  className="hidden sm:block px-3 py-2 text-xs rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-simba-orange dark:hover:bg-simba-orange dark:hover:text-white transition-colors"
                >
                  {t('branchOps')}
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 bg-simba-orange hover:bg-simba-orange-dark text-white px-3 sm:px-4 py-2 rounded-xl transition-colors"
                aria-label={t('openCart')}
              >
                <ShoppingCart className="w-5 h-5" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs opacity-80 leading-none">{t('myCart')}</p>
                  <p className="text-sm font-bold leading-tight">
                    {mounted ? (itemCount > 0 ? `${itemCount} ${t('itemsLabel', { count: itemCount })}` : t('empty')) : t('empty')}
                  </p>
                </div>
                {mounted && itemCount > 0 && (
                  <span className="sm:hidden absolute -top-1.5 -right-1.5 bg-simba-navy text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Category nav bar */}
        <div className="bg-simba-orange hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* Categories — direct link, no dropdown */}
                <Link
                  href={`/${locale}/products`}
                  className="flex items-center gap-2 px-5 py-3 bg-simba-orange-dark text-white font-bold text-sm hover:bg-orange-900 transition-colors"
                >
                  <LayoutGrid className="w-4 h-4" />
                  {t('categories')}
                </Link>

                <Link
                  href={`/${locale}/branch-reviews`}
                  className="flex items-center gap-2 px-6 py-3 text-white font-bold text-sm hover:bg-white/10 transition-colors border-l border-white/10"
                >
                  <Star className="w-4 h-4" />
                  {t('reviews')}
                </Link>

                <Link
                  href={`/${locale}/locations`}
                  className="flex items-center gap-2 px-6 py-3 text-white font-bold text-sm hover:bg-white/10 transition-colors border-l border-white/10"
                >
                  <MapPin className="w-4 h-4" />
                  {t('storeLocator')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="w-full pl-4 pr-4 py-2.5 rounded-l-xl border-2 border-r-0 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange"
                />
                <button type="submit" className="bg-simba-orange text-white px-4 rounded-r-xl">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
            <div className="space-y-2">
              <Link
                href={`/${locale}/products`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 bg-simba-orange text-white text-sm font-bold rounded-lg hover:bg-simba-orange-dark transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                {t('categories')}
              </Link>
              {currentUser && (
                <Link
                  href={`/${locale}/orders`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  My Orders
                </Link>
              )}
              <Link
                href={`/${locale}/branch-reviews`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Star className="w-4 h-4" />
                {t('reviews')}
              </Link>
              <Link
                href={`/${locale}/locations`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                {t('locations')}
              </Link>
              <Link
                href={`/${locale}`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {t('home')}
              </Link>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => switchLocale(lang.code)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${locale === lang.code ? 'bg-simba-orange text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} locale={locale} />

      {/* Branch Selection Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm touch-none">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 touch-auto">
            <div className="relative h-32 bg-simba-orange flex items-center justify-center">
              <div className="absolute top-4 left-4">
                 <Image src="/simba-logo.png" alt="Simba" width={40} height={40} className="brightness-0 invert" />
              </div>
              <MapPin className="w-12 h-12 text-white/20 absolute right-4 bottom-4" />
              <div className="text-center px-6">
                <h2 className="text-2xl font-black text-white leading-tight">{t('welcomeSimba')}</h2>
                <p className="text-orange-100 text-sm font-medium">{t('selectBranch')}</p>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t('branchPricingNote')}
              </p>
              
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {simbaBranches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => {
                      setBranchId(branch.id);
                      setShowBranchModal(false);
                      window.location.reload();
                    }}
                    className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-simba-orange dark:hover:border-simba-orange hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all group text-left"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-simba-orange transition-colors truncate">
                        {branch.name.replace('Simba Supermarket ', '')}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">{branch.district}, Kigali</p>
                      
                      {/* Rating badges */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-yellow-400/10 text-yellow-600 dark:text-yellow-500 px-1.5 py-0.5 rounded-lg">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-[10px] font-black">{branchRatings[branch.id]?.avg.toFixed(1) || '0.0'}</span>
                        </div>
                        <div className="flex items-center text-slate-400">
                          <MessageSquare className="w-2.5 h-2.5 mr-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{branchRatings[branch.id]?.count || 0} {t('reviews')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-simba-orange transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-200 dark:group-hover:shadow-none">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                   <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-snug">
                  {t('fastDeliveryNote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Add this to your layout/globals.css if not already there or use inline styles
// .custom-scrollbar::-webkit-scrollbar { width: 4px; }
// .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
