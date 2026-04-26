'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOperationsStore, OrderStatus, PickupOrder } from '@/store/operations';
import { simbaBranches } from '@/lib/branches';
import { products } from '@/lib/products';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ClipboardList, Package, CheckCircle2, Clock, User, 
  ChevronDown, RefreshCw, Search, ArrowUpDown, AlertTriangle, 
  BarChart3, X, Minus, Plus, ArrowRight, UserCheck, Play, 
  CheckCircle, MoreHorizontal, Bell, BellRing, Truck, MapPin, Navigation,
  ShieldCheck, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';

const STATUS_CONFIG: Record<OrderStatus, { color: string; icon: React.ReactNode; step: number }> = {
  pending:    { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',  icon: <Clock className="w-3.5 h-3.5" />, step: 1 },
  accepted:   { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',          icon: <Package className="w-3.5 h-3.5" />, step: 2 },
  ready:      { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',  icon: <CheckCircle2 className="w-3.5 h-3.5" />, step: 3 },
  dispatched: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',  icon: <Truck className="w-3.5 h-3.5" />, step: 4 },
  delivered:  { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',      icon: <CheckCircle2 className="w-3.5 h-3.5" />, step: 5 },
  completed:  { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',         icon: <CheckCircle2 className="w-3.5 h-3.5" />, step: 6 },
};

type StockFilter = 'all' | 'low' | 'out';

export default function BranchDashboardPage() {
  const t = useTranslations('branchDashboard');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const currentUser = useAuthStore((s) => s.currentUser);
  const initialized = useAuthStore((s) => s.initialized);
  const {
    orders, ordersLoading, fetchOrders,
    assignOrder, markReady, dispatchOrder, deliverOrder, completeOrder,
    stockByBranch, fetchStock, getBranchStock, setOutOfStock, restockProduct, updateStock,
    addCustomerFlag, fetchCustomerFlags, getCustomerFlagCount,
    subscribeToOrders
  } = useOperationsStore();

  // Determine role from auth store
  const authRole = currentUser?.role ?? 'customer';
  const isStaffOrAbove = ['staff', 'manager', 'admin'].includes(authRole);

  // Default role for UI: use auth role if staff/manager/admin, else default to 'staff'
  const defaultRole = authRole === 'admin' || authRole === 'manager' ? 'manager' : 'staff';

  const [branchId, setBranchId] = useState(
    currentUser?.branchId ?? simbaBranches[0].id
  );
  const [role, setRole] = useState<'manager' | 'staff'>(defaultRole);
  const [staffName, setStaffName] = useState(currentUser?.fullName || 'Staff A');
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [stockSearch, setStockSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [showAllProducts, setShowAllProducts] = useState(false);

  // All hooks must be declared before any conditional returns (React rules of hooks)
  useEffect(() => {
    if (!isStaffOrAbove) return;
    fetchOrders(branchId);
    fetchStock(branchId);
    fetchCustomerFlags();
    const unsubscribe = subscribeToOrders(branchId);
    return () => unsubscribe();
  }, [branchId, fetchOrders, fetchStock, fetchCustomerFlags, subscribeToOrders, isStaffOrAbove]);

  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount !== 0) {
      const hasNewPending = orders.some(o => o.status === 'pending' && !o.assignedTo);
      if (hasNewPending) {
        setNewOrderAlert(true);
        setTimeout(() => setNewOrderAlert(false), 5000);
      }
    }
    setLastOrderCount(orders.length);
  }, [orders, lastOrderCount]);

  const branchOrders = useMemo(
    () => orders.filter(o => o.branchId === branchId),
    [orders, branchId]
  );

  const displayOrders = useMemo(() => {
    if (role === 'manager') return branchOrders;
    return branchOrders.filter(o => o.assignedTo === staffName);
  }, [branchOrders, role, staffName]);

  const counts = useMemo(() => ({
    pending:   displayOrders.filter(o => o.status === 'pending').length,
    accepted:  displayOrders.filter(o => o.status === 'accepted').length,
    ready:     displayOrders.filter(o => o.status === 'ready').length,
    dispatched:displayOrders.filter(o => o.status === 'dispatched').length,
    completed: displayOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
  }), [displayOrders]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });

  const branchStock = useMemo(() => stockByBranch[branchId] ?? {}, [stockByBranch, branchId]);

  const inventoryProducts = useMemo(() => {
    let filtered = products;
    if (stockSearch.trim()) {
      const q = stockSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    if (stockFilter === 'out') {
      filtered = filtered.filter(p => (branchStock[p.id] ?? getBranchStock(branchId, p.id)) === 0);
    } else if (stockFilter === 'low') {
      filtered = filtered.filter(p => {
        const s = branchStock[p.id] ?? getBranchStock(branchId, p.id);
        return s > 0 && s < 5;
      });
    }
    return filtered;
  }, [stockSearch, stockFilter, branchStock, branchId, getBranchStock]);

  const displayedProducts = showAllProducts ? inventoryProducts : inventoryProducts.slice(0, 15);

  const stockSummary = useMemo(() => {
    let outCount = 0, lowCount = 0, okCount = 0;
    products.forEach(p => {
      const s = branchStock[p.id] ?? 25;
      if (s === 0) outCount++;
      else if (s < 5) lowCount++;
      else okCount++;
    });
    return { out: outCount, low: lowCount, ok: okCount, total: products.length };
  }, [branchStock]);

  // ── Auth gate (after all hooks) ───────────────────────────
  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-simba-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isStaffOrAbove) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-simba-orange" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('staffAccessRequired')}</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            {t('staffAccessDescription')}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/${locale}/admin/login`}
              className="inline-flex items-center justify-center gap-2 bg-simba-orange text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {t('signInAsStaff')}
            </Link>
            <Link href={`/${locale}`} className="text-sm text-slate-400 hover:text-simba-orange transition-colors">
              ← {t('backToStore')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="bg-slate-900 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-simba-orange rounded-xl flex items-center justify-center shadow-lg shadow-simba-orange/20">
              <ClipboardList className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight leading-none">{t('title')}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('liveOperationsMode')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={() => { fetchOrders(branchId); fetchStock(branchId); }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
              title={t('refresh')}
            >
              <RefreshCw className={cn("w-4 h-4 text-slate-400", ordersLoading && "animate-spin")} />
            </button>
            <div className="relative group">
              <div className={cn(
                "absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 z-10 transition-all scale-0",
                newOrderAlert && "scale-100"
              )} />
              <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                {newOrderAlert ? <BellRing className="w-4 h-4 text-simba-orange animate-bounce" /> : <Bell className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                 <div className="relative min-w-[200px]">
                    <span className="absolute -top-2 left-3 px-1.5 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest z-10">{t('activeBranch')}</span>
                    <select
                      value={branchId}
                      onChange={e => setBranchId(e.target.value)}
                      className="w-full appearance-none border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-simba-orange/20 focus:border-simba-orange transition-all"
                    >
                      {simbaBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                 </div>
                 <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {(['manager', 'staff'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={cn(
                          "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                          role === r 
                            ? "bg-white dark:bg-slate-700 text-simba-orange shadow-sm" 
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                        )}
                      >
                        {r === 'manager' ? t('managerRole') : t('staffRole')}
                      </button>
                    ))}
                 </div>
              </div>
              {role === 'staff' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 bg-orange-50 dark:bg-orange-950/20 px-4 py-2 rounded-xl border border-orange-100 dark:border-orange-900/30">
                  <User className="w-4 h-4 text-simba-orange" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('activeStaff')}</span>
                  <input value={staffName} onChange={e => setStaffName(e.target.value)} className="bg-transparent text-sm font-bold text-simba-orange focus:outline-none border-b border-simba-orange/30 w-32" />
                </motion.div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: t('pending'),   count: counts.pending,   color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                { label: t('preparing'), count: counts.accepted,  color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { label: t('ready'),     count: counts.ready,     color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                { label: t('dispatched'),count: counts.dispatched,color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                { label: t('completed'), count: counts.completed, color: 'text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-800/50' },
              ].map(s => (
                <div key={s.label} className={cn("flex flex-col items-center justify-center px-4 py-3 rounded-2xl border border-transparent transition-all", s.bg)}>
                  <span className={cn("text-xl font-black", s.color)}>{s.count}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-simba-orange" />
              {t('operationsQueue')}
              <span className="text-xs font-bold text-slate-400 normal-case ml-2">({displayOrders.length} {t('ordersCount')})</span>
            </h2>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {displayOrders.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('noOrders')}</h3>
                  </motion.div>
                ) : (
                  displayOrders.map((order) => (
                    <OrderCard key={order.id} order={order} role={role} staffName={staffName} t={t} formatTime={formatTime} flagCount={getCustomerFlagCount(order.customerEmail)} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-simba-orange" />
                  <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('quickInventory')}</h2>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <StockBadge label={t('all')} count={stockSummary.total} active={stockFilter === 'all'} onClick={() => setStockFilter('all')} color="slate" />
                  <StockBadge label={t('low')} count={stockSummary.low} active={stockFilter === 'low'} onClick={() => setStockFilter('low')} color="yellow" />
                  <StockBadge label={t('out')} count={stockSummary.out} active={stockFilter === 'out'} onClick={() => setStockFilter('out')} color="red" />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={stockSearch} onChange={e => setStockSearch(e.target.value)} placeholder={t('productSearch')} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-simba-orange/20" />
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
                {displayedProducts.map(product => (
                  <InventoryItem key={product.id} product={product} stock={branchStock[product.id] ?? getBranchStock(branchId, product.id)} branchId={branchId} t={t} />
                ))}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                 <button onClick={() => setShowAllProducts(!showAllProducts)} className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-simba-orange transition-colors">
                  {showAllProducts ? t('showLess') : t('viewAllCount', { count: inventoryProducts.length })}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, role, staffName, t, formatTime, flagCount }: { 
  order: PickupOrder, role: string, staffName: string, t: any, formatTime: any, flagCount: number 
}) {
  const { assignOrder, markReady, dispatchOrder, deliverOrder, completeOrder, addCustomerFlag } = useOperationsStore();
  const cfg = STATUS_CONFIG[order.status];
  const statusLabel = (status: OrderStatus) => {
    if (status === 'pending') return t('pending');
    if (status === 'accepted') return t('preparing');
    if (status === 'ready') return t('ready');
    if (status === 'dispatched') return t('dispatched');
    if (status === 'delivered') return t('delivered');
    return t('completed');
  };
  const isManager = role === 'manager';
  const isDelivery = order.orderType === 'delivery';
  
  const stepVariants = {
    inactive: { scale: 0.8, opacity: 0.3 },
    active: { scale: 1.1, opacity: 1, backgroundColor: '#F97316' },
    completed: { scale: 1, opacity: 1, backgroundColor: '#16A34A' }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={cn("bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all overflow-hidden", flagCount > 1 ? "border-red-200" : "border-slate-100 dark:border-slate-800 shadow-sm")}>
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", isDelivery ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-simba-orange")}>
                {isDelivery ? <Truck className="w-6 h-6" /> : <Package className="w-6 h-6" />}
             </div>
             <div>
               <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">#{order.id.slice(-6).toUpperCase()} <span className="text-slate-300 font-normal">|</span> <span className={isDelivery ? "text-blue-600" : "text-simba-orange"}>{isDelivery ? t('delivery') : t('pickup')}</span></h3>
                 {flagCount > 0 && <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">! {flagCount} {t('flagsLabel')}</span>}
               </div>
               <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                 <User className="w-3.5 h-3.5" /> {order.customerName}
                 <span className="text-slate-300">·</span>
                 <Clock className="w-3.5 h-3.5" /> {order.timeSlot}
               </p>
             </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
             <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest", cfg.color)}>
                {cfg.icon} {statusLabel(order.status)}
             </span>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatTime(order.createdAt)} | {formatPrice(order.totalAmount || order.deposit)}</span>
          </div>
        </div>

        {isDelivery && order.deliveryAddress && (
          <div className="mb-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
             <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-800 dark:text-blue-400">{t('destinationAddress')}</p>
               <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{order.deliveryAddress}, {order.deliveryDistrict}</p>
             </div>
          </div>
        )}

        <div className="relative flex justify-between mb-8 max-w-xs mx-auto">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2" />
           {[1, 2, 3, 4, 5, 6].map((s) => (
             <motion.div key={s} variants={stepVariants} animate={cfg.step > s ? "completed" : cfg.step === s ? "active" : "inactive"} className="w-2.5 h-2.5 rounded-full relative z-10" />
           ))}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
           <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[11px] font-bold">
                   <span className="text-slate-400 w-4">×{item.quantity}</span>
                   <span className="text-slate-700 dark:text-slate-200 truncate">{item.name}</span>
                </li>
              ))}
           </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-3">
             {order.assignedTo ? (
               <div className="flex items-center gap-2">
                 <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-tight text-slate-900 dark:text-white">{order.assignedTo}</span>
               </div>
             ) : (
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic animate-pulse">{t('awaitingAssignmentShort')}</span>
             )}
           </div>

           <div className="flex items-center gap-2">
              {isManager && order.status === 'pending' && (
                <button onClick={() => { const name = window.prompt(t('enterStaffName'), t('staffDefaultName')); if (name) assignOrder(order.id, name); }} className="bg-simba-orange text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-orange-100">
                  <UserCheck className="w-4 h-4" /> {t('acceptAssign')}
                </button>
              )}
              {!isManager && order.status === 'accepted' && order.assignedTo === staffName && (
                <button onClick={() => markReady(order.id)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-100">
                  <Play className="w-4 h-4" /> {t('markReady')}
                </button>
              )}
              {!isManager && order.status === 'ready' && order.assignedTo === staffName && (
                isDelivery ? (
                  <button onClick={() => dispatchOrder(order.id)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-indigo-100">
                    <Truck className="w-4 h-4" /> {t('dispatchOrder')}
                  </button>
                ) : (
                  <button onClick={() => completeOrder(order.id)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-green-100">
                    <CheckCircle className="w-4 h-4" /> {t('completePickup')}
                  </button>
                )
              )}
              {!isManager && order.status === 'dispatched' && order.assignedTo === staffName && (
                <button onClick={() => deliverOrder(order.id)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-green-100">
                  <Navigation className="w-4 h-4" /> {t('markDelivered')}
                </button>
              )}
              {!isManager && order.status === 'delivered' && order.assignedTo === staffName && (
                <button onClick={() => completeOrder(order.id)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95">
                  {t('complete')}
                </button>
              )}
              {order.status === 'completed' && <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">{t('handedOver')}</span></div>}
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function InventoryItem({ product, stock, branchId, t }: { product: any, stock: number, branchId: string, t: any }) {
  const { setOutOfStock, restockProduct, updateStock } = useOperationsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editQty, setEditQty] = useState(stock);
  return (
    <div className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{product.name}</h4>
        <div className="flex items-center gap-2 mt-0.5">
           <span className={cn("w-1.5 h-1.5 rounded-full", stock === 0 ? "bg-red-500" : stock < 5 ? "bg-yellow-500" : "bg-green-500")} />
           <span className={cn("text-[10px] font-bold", stock === 0 ? "text-red-500" : stock < 5 ? "text-yellow-600" : "text-slate-500")}>{stock === 0 ? t('outOfStock') : t('unitsCount', { count: stock })}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-1">
             <input type="number" value={editQty} onChange={e => setEditQty(parseInt(e.target.value) || 0)} className="w-12 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-1 text-[10px] font-bold text-center outline-none" />
             <button onClick={() => { updateStock(branchId, product.id, editQty); setIsEditing(false); }} className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><CheckCircle className="w-3.5 h-3.5" /></button>
             <button onClick={() => setIsEditing(false)} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <>
            <button onClick={() => { setEditQty(stock); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-simba-orange opacity-0 group-hover:opacity-100"><ArrowUpDown className="w-4 h-4" /></button>
            {stock > 0 ? <button onClick={() => setOutOfStock(branchId, product.id)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all">{t('setZero')}</button> : <button onClick={() => restockProduct(branchId, product.id)} className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-900/30 transition-all">{t('restock')}</button>}
          </>
        )}
      </div>
    </div>
  );
}

function StockBadge({ label, count, active, onClick, color }: { label: string, count: number, active: boolean, onClick: () => void, color: 'slate' | 'yellow' | 'red' }) {
  const colors = {
    slate: active ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-500",
    yellow: active ? "bg-yellow-500 text-white" : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600",
    red: active ? "bg-red-500 text-white" : "bg-red-50 dark:bg-red-900/20 text-red-600"
  };
  return (
    <button onClick={onClick} className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", colors[color])}>
      {label} ({count})
    </button>
  );
}
