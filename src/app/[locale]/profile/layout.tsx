'use client';

import { useTranslations } from 'next-intl';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfileLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { currentUser, logout } = useAuthStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted && !currentUser) {
    redirect(`/${locale}/auth/login`);
  }

  const menuItems = [
    { icon: User, label: 'Personal Info', href: `/${locale}/profile` },
    { icon: ShoppingBag, label: 'My Orders', href: `/${locale}/profile/orders` },
    { icon: Heart, label: 'Wishlist', href: `/${locale}/profile/wishlist` },
    { icon: MapPin, label: 'Addresses', href: `/${locale}/profile/addresses` },
    { icon: Settings, label: 'Settings', href: `/${locale}/profile/settings` },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-simba-orange/10 flex items-center justify-center text-simba-orange text-2xl font-black mx-auto mb-4">
                {currentUser?.fullName.charAt(0)}
              </div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100">{currentUser?.fullName}</h2>
              <p className="text-xs text-slate-500 mt-1">{currentUser?.email}</p>
            </div>

            <nav className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-2 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-simba-orange text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-simba-orange'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    <ChevronRight className={`w-4 h-4 ml-auto ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  </Link>
                );
              })}
              <button
                onClick={() => { logout(); redirect(`/${locale}`); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
