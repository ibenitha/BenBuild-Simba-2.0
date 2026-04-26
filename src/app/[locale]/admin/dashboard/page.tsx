'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/auth';
import { useOperationsStore } from '@/store/operations';
import { simbaBranches } from '@/lib/branches';
import { products } from '@/lib/products';
import { formatPrice, cn } from '@/lib/utils';
import {
  BarChart3, TrendingUp, Users, Package, MapPin, Star,
  ShieldCheck, LogIn, RefreshCw, ArrowRight, CheckCircle2,
  Clock, Truck, AlertTriangle, ChevronRight, Store,
  DollarSign, ShoppingBag, Activity, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, color, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; trend?: { value: number; positive: boolean };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            'text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest',
            trend.positive
              ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
          )}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

// ── Branch Row ────────────────────────────────────────────────
function BranchRow({
  branch, orders, reviews, locale, t,
}: {
  branch: typeof simbaBranches[0];
  orders: ReturnType<typeof useOperationsStore.getState>['orders'];
  reviews: ReturnType<typeof useOperationsStore.getState>['reviews'];
  locale: string;
  t: (key: string) => string;
}) {
  const branchOrders = orders.filter(o => o.branchId === branch.id);
  const pending = branchOrders.filter(o => o.status === 'pending').length;
  const completed = branchOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
  const revenue = branchOrders
    .filter(o => o.status === 'completed' || o.status === 'delivered')
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const branchReviews = reviews.filter(r => r.branchId === branch.id);
  const avgRating = branchReviews.length
    ? branchReviews.reduce((s, r) => s + r.rating, 0) / branchReviews.length
    : 0;

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0">
      {/* Branch name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-simba-orange/10 flex items-center justify-center flex-shrink-0">
          <Store className="w-4 h-4 text-simba-orange" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {branch.name.replace('Simba Supermarket ', '')}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{branch.district}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6 text-center">
        <div>
          <p className="text-sm font-black text-yellow-600">{pending}</p>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest">{t('pending')}</p>
        </div>
        <div>
          <p className="text-sm font-black text-green-600">{completed}</p>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest">{t('done')}</p>
        </div>
        <div>
          <p className="text-sm font-black text-simba-orange">{formatPrice(revenue)}</p>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest">{t('revenue')}</p>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <p className="text-sm font-black text-slate-700 dark:text-slate-200">
            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
          </p>
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/${locale}/branch-dashboard`}
        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-simba-orange hover:text-orange-600 transition-colors flex-shrink-0"
      >
        {t('manage')} <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function MarketRepDashboard({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const t = useTranslations('marketRepDashboard');
  const { currentUser, initialized } = useAuthStore();
  const {
    orders, fetchOrders,
    reviews, fetchReviews,
    stockByBranch, fetchStock,
    customerFlags, fetchCustomerFlags,
  } = useOperationsStore();

  const isManagerOrAdmin = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  // Fetch data for all branches
  useEffect(() => {
    fetchOrders();
    fetchReviews();
    fetchCustomerFlags();
    simbaBranches.forEach(b => fetchStock(b.id));
  }, [fetchOrders, fetchReviews, fetchCustomerFlags, fetchStock]);

  // ── Computed stats ──────────────────────────────────────────
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
    const totalRevenue = orders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
    const lowStockCount = simbaBranches.reduce((count, b) => {
      const stock = stockByBranch[b.id] ?? {};
      return count + products.filter(p => (stock[p.id] ?? 25) < 5).length;
    }, 0);
    const flaggedCustomers = new Set(customerFlags.map(f => f.customerEmail)).size;

    return {
      totalOrders, pendingOrders, completedOrders,
      totalRevenue, avgRating, lowStockCount, flaggedCustomers,
    };
  }, [orders, reviews, stockByBranch, customerFlags]);

  // Recent orders (last 10)
  const recentOrders = useMemo(() =>
    [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [orders]
  );

  // ── Auth gate ───────────────────────────────────────────────
  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-simba-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    accepted:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ready:      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    dispatched: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    delivered:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-simba-orange rounded-xl flex items-center justify-center shadow-lg shadow-simba-orange/20">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight leading-none">
                {t('title')}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('allBranchesLive')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/branch-dashboard`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-all"
            >
              <Activity className="w-3.5 h-3.5" />
              {t('branchOps')}
            </Link>
            <button
              onClick={() => { fetchOrders(); fetchReviews(); }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
              title={t('refresh')}
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!isManagerOrAdmin && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              {t('readonlyModeNotice')}
            </p>
            <Link
              href={`/${locale}/admin/login`}
              className="inline-flex items-center justify-center gap-2 bg-simba-orange text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-orange-600 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t('signInAsManager')}
            </Link>
          </div>
        )}

        {/* ── KPI Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard
            label={t('totalOrders')}
            value={stats.totalOrders}
            sub={t('allBranchesCombined')}
            icon={<ShoppingBag className="w-5 h-5" />}
            color="bg-simba-orange/10 text-simba-orange"
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            label={t('pending')}
            value={stats.pendingOrders}
            sub={t('awaitingAssignment')}
            icon={<Clock className="w-5 h-5" />}
            color="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20"
          />
          <StatCard
            label={t('completed')}
            value={stats.completedOrders}
            sub={t('deliveredOrPicked')}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="bg-green-50 text-green-600 dark:bg-green-900/20"
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            label={t('totalRevenue')}
            value={formatPrice(stats.totalRevenue)}
            sub={t('completedOrdersSub')}
            icon={<DollarSign className="w-5 h-5" />}
            color="bg-blue-50 text-blue-600 dark:bg-blue-900/20"
            trend={{ value: 5, positive: true }}
          />
          <StatCard
            label={t('avgRating')}
            value={stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : '—'}
            sub={t('reviewsCount', { count: reviews.length })}
            icon={<Star className="w-5 h-5" />}
            color="bg-yellow-50 text-yellow-500 dark:bg-yellow-900/20"
          />
          <StatCard
            label={t('lowStockItems')}
            value={stats.lowStockCount}
            sub={t('acrossAllBranches')}
            icon={<Package className="w-5 h-5" />}
            color={stats.lowStockCount > 10 ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}
          />
          <StatCard
            label={t('flaggedCustomers')}
            value={stats.flaggedCustomers}
            sub={t('noShowOrIssues')}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="bg-red-50 text-red-500 dark:bg-red-900/20"
          />
          <StatCard
            label={t('activeBranches')}
            value={`${simbaBranches.length} / ${simbaBranches.length}`}
            sub={t('allKigaliBranches')}
            icon={<MapPin className="w-5 h-5" />}
            color="bg-simba-orange/10 text-simba-orange"
          />
        </div>

        {/* ── Main grid ───────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Branch Overview */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-simba-orange" />
                <h2 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">
                  {t('allBranches')}
                </h2>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {simbaBranches.length}
                </span>
              </div>
              <Link
                href={`/${locale}/locations`}
                className="text-[10px] font-black uppercase tracking-widest text-simba-orange hover:text-orange-600 transition-colors flex items-center gap-1"
              >
                {t('viewMap')} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {simbaBranches.map(branch => (
                <BranchRow
                  key={branch.id}
                  branch={branch}
                  orders={orders}
                  reviews={reviews}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-simba-orange" />
                <h2 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">
                  {t('recentOrders')}
                </h2>
              </div>
              <Link
                href={`/${locale}/branch-dashboard`}
                className="text-[10px] font-black uppercase tracking-widest text-simba-orange hover:text-orange-600 transition-colors"
              >
                {t('all')} →
              </Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[520px] overflow-y-auto">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">{t('noOrdersYet')}</p>
                </div>
              ) : recentOrders.map(order => {
                const branch = simbaBranches.find(b => b.id === order.branchId);
                return (
                  <div key={order.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {order.customerName}
                        </p>
                      </div>
                      <span className={cn(
                        'text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0',
                        STATUS_COLORS[order.status] ?? STATUS_COLORS.pending
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {branch?.name.replace('Simba Supermarket ', '') ?? order.branchId}
                      </p>
                      <p className="text-[10px] font-bold text-simba-orange">
                        {formatPrice(order.totalAmount || order.deposit)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <h2 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-simba-orange" />
            {t('quickActions')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t('branchOperations'), href: `/${locale}/branch-dashboard`, icon: <Activity className="w-5 h-5" />, color: 'bg-simba-orange text-white' },
              { label: t('branchReviews'), href: `/${locale}/branch-reviews`, icon: <Star className="w-5 h-5" />, color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' },
              { label: t('storeLocations'), href: `/${locale}/locations`, icon: <MapPin className="w-5 h-5" />, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
              { label: t('allProducts'), href: `/${locale}/products`, icon: <Package className="w-5 h-5" />, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
            ].map(action => (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95',
                  action.color
                )}
              >
                {action.icon}
                <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
