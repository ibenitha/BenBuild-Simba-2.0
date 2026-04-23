'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { ShoppingCart, Search, Sun, Moon, Menu, X, Globe, ChevronDown, LayoutGrid, Heart, Phone } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import CartDrawer from '@/components/cart/CartDrawer';
import { useRouter, usePathname } from 'next/navigation';
import { categories } from '@/lib/products';
import { useAuthStore } from '@/store/auth';

interface NavbarProps {
  locale: string;
}

export default function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('nav');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const itemCount = useCartStore(s => s.itemCount());
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
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
      <div className="bg-simba-navy dark:bg-slate-950 text-white text-xs py-2 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +250 788 000 000</span>
            <span>📧 info@simbasupermarket.rw</span>
          </div>
          <div className="flex items-center gap-4">
            <span>🚚 Free delivery on orders over 20,000 RWF</span>
            <span>📍 Kigali, Rwanda</span>
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
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
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
              </div>
            </form>

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

              {/* Dark mode */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Wishlist */}
              <button className="hidden sm:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Heart className="w-5 h-5" />
              </button>

              {currentUser ? (
                <button
                  onClick={() => logout()}
                  className="hidden sm:block px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:border-simba-orange"
                >
                  {t('logout')}
                </button>
              ) : (
                <Link
                  href={`/${locale}/auth/login`}
                  className="hidden sm:block px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:border-simba-orange"
                >
                  {t('login')}
                </Link>
              )}

              <Link
                href={`/${locale}/branch-dashboard`}
                className="hidden sm:block px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:border-simba-orange"
              >
                {t('branchOps')}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 bg-simba-orange hover:bg-simba-orange-dark text-white px-3 sm:px-4 py-2 rounded-xl transition-colors"
                aria-label="Open cart"
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

        {/* Category nav bar - like the real Simba site */}
        <div className="bg-simba-orange hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
              {/* All categories dropdown */}
              <div className="relative group flex-shrink-0">
                <button
                  onMouseEnter={() => setCatMenuOpen(true)}
                  onMouseLeave={() => setCatMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 bg-simba-orange-dark text-white font-semibold text-sm hover:bg-orange-900 transition-colors"
                >
                  <LayoutGrid className="w-4 h-4" />
                  {t('categories')}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {catMenuOpen && (
                  <div
                    onMouseEnter={() => setCatMenuOpen(true)}
                    onMouseLeave={() => setCatMenuOpen(false)}
                    className="absolute left-0 top-full bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700 rounded-b-xl w-64 z-50 py-2"
                  >
                    {categories.map(cat => (
                      <Link
                        key={cat.id}
                        href={`/${locale}/category/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-simba-orange transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-simba-orange flex-shrink-0" />
                        {cat.name}
                        <span className="ml-auto text-xs text-slate-400">{cat.productCount}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Individual category links */}
              {categories.slice(0, 7).map(cat => (
                <Link
                  key={cat.id}
                  href={`/${locale}/category/${cat.slug}`}
                  className="flex-shrink-0 px-4 py-3 text-white text-sm font-medium hover:bg-simba-orange-dark transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href={`/${locale}`}
                className="flex-shrink-0 px-4 py-3 text-white/80 text-sm font-medium hover:bg-simba-orange-dark transition-colors whitespace-nowrap"
              >
                More →
              </Link>
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
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/${locale}/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 bg-orange-50 dark:bg-slate-800 text-simba-orange text-sm font-medium rounded-lg hover:bg-orange-100 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
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
    </>
  );
}
