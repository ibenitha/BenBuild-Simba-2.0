'use client';

import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Package,
  List,
  Users,
  Store,
  BarChart3,
  Settings,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useAdminStore } from '@/store/admin';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { currentUser } = useAuthStore();
  const { isAdmin } = useAdminStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted && !isAdmin(currentUser)) {
    redirect(`/${locale}/auth/login`);
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: `/${locale}/admin` },
    { icon: Package, label: 'Products', href: `/${locale}/admin/products` },
    { icon: List, label: 'Categories', href: `/${locale}/admin/categories` },
    { icon: ShoppingBag, label: 'Orders', href: `/${locale}/admin/orders` },
    { icon: Users, label: 'Users', href: `/${locale}/admin/users` },
    { icon: Store, label: 'Branches', href: `/${locale}/admin/branches` },
    { icon: BarChart3, label: 'Analytics', href: `/${locale}/admin/analytics` },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="font-black text-xl text-simba-orange tracking-tight">SIMBA</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-simba-orange text-white shadow-lg shadow-orange-200 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-simba-orange'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-simba-orange/20 flex items-center justify-center text-simba-orange font-bold">
                {currentUser?.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser?.fullName}</p>
                <p className="text-xs text-slate-500 truncate">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="font-bold text-slate-800 dark:text-slate-100">
            {menuItems.find(item => item.href === pathname)?.label || 'Dashboard'}
          </h1>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors relative">
              <AlertCircle className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:border-slate-800"></div>
            <Link
              href={`/${locale}`}
              className="text-xs font-semibold text-simba-orange hover:underline"
            >
              Back to Site
            </Link>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
