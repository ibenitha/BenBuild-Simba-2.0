'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { getProductById } from '@/lib/products';
import { simbaBranches } from '@/lib/branches';
import { formatPrice } from '@/lib/utils';
import {
  ShoppingBag, RotateCcw, ChevronRight, Clock, MapPin,
  CheckCircle, Package, Truck, AlertCircle, Loader2, Home,
  ShoppingCart, Receipt
} from 'lucide-react';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  branch_id: string;
  time_slot: string;
  status: 'pending' | 'accepted' | 'ready' | 'dispatched' | 'delivered' | 'completed';
  order_type: 'pickup' | 'delivery';
  total_amount: number;
  deposit: number;
  delivery_address?: string;
  delivery_district?: string;
  delivery_fee?: number;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_CONFIG: Record<Order['status'], { color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: <Clock className="w-3.5 h-3.5" /> },
  accepted:  { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: <Package className="w-3.5 h-3.5" /> },
  ready:     { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  dispatched:{ color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  completed: { color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-RW', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OrdersPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('ordersPage');
  const router = useRouter();
  const user = useAuthStore(s => s.currentUser);
  const { addItem, items: cartItems } = useCartStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState<string | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    void fetchOrders();
  }, [fetchOrders, locale, router, user]);

  // Poll for order status updates every 15 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders, user]);

  const handleReorder = async (order: Order) => {
    setReordering(order.id);
    let added = 0;
    for (const item of order.order_items) {
      const product = getProductById(item.product_id);
      if (product) {
        for (let i = 0; i < item.quantity; i++) addItem(product);
        added++;
      }
    }
    setReordering(null);
    if (added > 0) {
      setReorderSuccess(order.id);
      setTimeout(() => setReorderSuccess(null), 3000);
    }
  };

  const getBranchName = (branchId: string) =>
    simbaBranches.find(b => b.id === branchId)?.name.replace('Simba Supermarket ', '') ?? branchId;

  const statusLabel = (status: Order['status']) => {
    if (status === 'pending') return t('pending');
    if (status === 'accepted') return t('accepted');
    if (status === 'ready') return t('ready');
    if (status === 'dispatched') return t('onTheWay');
    if (status === 'delivered') return t('delivered');
    return t('completed');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-8">
          <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-simba-orange transition-colors">
            <Home className="w-3.5 h-3.5" /> {t('home')}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-simba-orange">{t('myOrders')}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-simba-orange/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-simba-orange" />
              </div>
              {t('myOrders')}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {user.fullName} · {user.email}
            </p>
          </div>
          <Link
            href={`/${locale}/products`}
            className="hidden sm:flex items-center gap-2 bg-simba-orange text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-simba-orange-dark transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {t('shopNow')}
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-simba-orange animate-spin" />
            <p className="text-sm text-slate-500 font-medium">{t('loadingOrders')}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{t('noOrdersYet')}</h3>
            <p className="text-slate-500 text-sm mb-8">{t('emptyHistory')}</p>
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center gap-2 bg-simba-orange text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-simba-orange-dark transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
            >
              {t('startShopping')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => {
              const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const branchName = getBranchName(order.branch_id);
              const isReordering = reordering === order.id;
              const didReorder = reorderSuccess === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Order header */}
                  <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-black text-sm text-slate-900 dark:text-white">#{order.id}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color}`}>
                        {status.icon}
                        {statusLabel(order.status)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {order.order_type === 'delivery' ? (
                          <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {t('delivery')}</span>
                        ) : (
                          <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {t('pickup')}</span>
                        )}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(order.created_at)}</span>
                  </div>

                  {/* Order body */}
                  <div className="px-5 py-4">
                    {/* Branch / address */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-simba-orange flex-shrink-0" />
                      {order.order_type === 'delivery' && order.delivery_address
                        ? `${order.delivery_address}, ${order.delivery_district}`
                        : branchName}
                      {order.time_slot && (
                        <>
                          <span className="text-slate-300">·</span>
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          {order.time_slot}
                        </>
                      )}
                    </div>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {order.order_items.map(item => {
                        const product = getProductById(item.product_id);
                        return (
                          <div key={item.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                            {product?.image && (
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                                <Image
                                  src={product.image}
                                  alt={item.name}
                                  fill
                                  sizes="32px"
                                  className="object-contain p-0.5"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[140px] truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-400">×{item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer: total + reorder */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">{t('orderTotal')}</p>
                        <p className="font-black text-simba-orange text-base">{formatPrice(order.total_amount)}</p>
                      </div>

                      <button
                        onClick={() => handleReorder(order)}
                        disabled={isReordering}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          didReorder
                            ? 'bg-green-500 text-white'
                            : 'bg-simba-orange hover:bg-simba-orange-dark text-white shadow-sm'
                        }`}
                      >
                        {isReordering ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : didReorder ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        {didReorder ? t('addedToCart') : isReordering ? t('adding') : t('reorder')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cart nudge after reorder */}
        {reorderSuccess && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-bottom-4 duration-300">
            <CheckCircle className="w-5 h-5 text-green-400" />
            {t('itemsAddedToCart')}
            <Link
              href={`/${locale}/cart`}
              className="ml-2 bg-simba-orange text-white px-3 py-1.5 rounded-lg text-xs font-black hover:bg-simba-orange-dark transition-colors"
            >
              {t('viewCart')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
