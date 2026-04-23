'use client';

import { useState, useEffect, useMemo } from 'react';
import { useOperationsStore, OrderStatus } from '@/store/operations';
import { simbaBranches } from '@/lib/branches';
import { products } from '@/lib/products';
import { useTranslations } from 'next-intl';
import { ClipboardList, Package, CheckCircle2, Clock, User, ChevronDown, RefreshCw } from 'lucide-react';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',  icon: <Clock className="w-3.5 h-3.5" /> },
  accepted:  { label: 'Preparing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',          icon: <Package className="w-3.5 h-3.5" /> },
  ready:     { label: 'Ready',     color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',       icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',          icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

export default function BranchDashboardPage() {
  const t = useTranslations('branchDashboard');
  const {
    orders, ordersLoading, fetchOrders,
    assignOrder, markReady, completeOrder,
    stockByBranch, fetchStock, getBranchStock, setOutOfStock,
  } = useOperationsStore();

  const [branchId, setBranchId] = useState(simbaBranches[0].id);
  const [role, setRole] = useState<'manager' | 'staff'>('manager');
  const [staffName, setStaffName] = useState('Staff A');

  // Fetch orders + stock on mount and branch change
  useEffect(() => {
    fetchOrders(branchId);
    fetchStock(branchId);
  }, [branchId, fetchOrders, fetchStock]);

  // Auto-refresh every 15 seconds (live dashboard feel)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(branchId);
    }, 15000);
    return () => clearInterval(interval);
  }, [branchId, fetchOrders]);

  const branchOrders = useMemo(
    () => orders.filter(o => o.branchId === branchId),
    [orders, branchId]
  );

  const counts = useMemo(() => ({
    pending:   branchOrders.filter(o => o.status === 'pending').length,
    accepted:  branchOrders.filter(o => o.status === 'accepted').length,
    ready:     branchOrders.filter(o => o.status === 'ready').length,
    completed: branchOrders.filter(o => o.status === 'completed').length,
  }), [branchOrders]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });

  const branchStock = stockByBranch[branchId] ?? {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => { fetchOrders(branchId); fetchStock(branchId); }}
          disabled={ordersLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:border-simba-orange transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <select
            value={branchId}
            onChange={e => setBranchId(e.target.value)}
            className="appearance-none border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-9 py-2.5 bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:border-simba-orange"
          >
            {simbaBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {(['manager', 'staff'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors ${role === r ? 'bg-simba-orange text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {r === 'manager' ? t('managerRole') : t('staffRole')}
            </button>
          ))}
        </div>

        {role === 'staff' && (
          <div className="relative flex items-center">
            <User className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              value={staffName}
              onChange={e => setStaffName(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-simba-orange"
            />
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('pending'),   count: counts.pending,   color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: t('preparing'), count: counts.accepted,  color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: t('ready'),     count: counts.ready,     color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: t('completed'), count: counts.completed, color: 'text-slate-500',  bg: 'bg-slate-50 dark:bg-slate-800' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders list */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-simba-orange" />
            <h2 className="font-bold text-slate-900 dark:text-white">{t('orders')}</h2>
            <span className="ml-auto text-xs text-slate-400">{branchOrders.length} {t('total')}</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {ordersLoading && branchOrders.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-400">Loading orders...</div>
            )}
            {!ordersLoading && branchOrders.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-400">{t('noOrders')}</div>
            )}
            {branchOrders.map(order => {
              const cfg = STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{order.id}</p>
                      <p className="text-xs text-slate-500">{order.customerName} · {order.timeSlot} · {formatTime(order.createdAt)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <ul className="text-xs text-slate-500 mb-3 space-y-0.5">
                    {order.items.map(item => (
                      <li key={item.productId} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-simba-orange flex-shrink-0" />
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>

                  {order.assignedTo && (
                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <User className="w-3 h-3" /> {t('assignedTo')}: <span className="font-semibold text-slate-600 dark:text-slate-300">{order.assignedTo}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {role === 'manager' && order.status === 'pending' && (
                      <button
                        onClick={() => assignOrder(order.id, staffName)}
                        className="bg-simba-orange hover:bg-simba-orange-dark text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        {t('assignToStaffA')}
                      </button>
                    )}
                    {role === 'staff' && order.status === 'accepted' && order.assignedTo === staffName && (
                      <button
                        onClick={() => markReady(order.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        {t('markReady')}
                      </button>
                    )}
                    {role === 'staff' && order.status === 'ready' && (
                      <button
                        onClick={() => completeOrder(order.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        {t('completePickup')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Inventory panel */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-simba-orange" />
            <h2 className="font-bold text-slate-900 dark:text-white">{t('quickInventory')}</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.slice(0, 12).map(product => {
              const stock = branchStock[product.id] ?? getBranchStock(branchId, product.id);
              return (
                <div key={product.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{product.name}</p>
                    <p className={`text-xs font-medium ${stock === 0 ? 'text-red-500' : stock < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {stock === 0 ? t('outOfStock') : `${stock} ${t('stock')}`}
                    </p>
                  </div>
                  {stock > 0 && (
                    <button
                      onClick={() => setOutOfStock(branchId, product.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      {t('markOutOfStock')}
                    </button>
                  )}
                  {stock === 0 && (
                    <span className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex-shrink-0">
                      Out
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
