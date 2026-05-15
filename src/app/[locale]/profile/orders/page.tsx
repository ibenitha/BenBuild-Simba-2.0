'use client';

import { useOrderStore } from '@/store/orders';
import { useAuthStore } from '@/store/auth';
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function OrderHistory({ params: { locale } }: { params: { locale: string } }) {
  const { currentUser } = useAuthStore();
  const { getUserOrders } = useOrderStore();
  const orders = getUserOrders(currentUser?.email || '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">My Orders</h1>
        <div className="bg-orange-50 dark:bg-orange-950/30 text-simba-orange text-xs font-bold px-3 py-1.5 rounded-full">
          {orders.length} total orders
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">No orders yet</h2>
          <p className="text-sm text-slate-400 mt-1 mb-8">When you place an order, it will appear here.</p>
          <Link
            href={`/${locale}`}
            className="bg-simba-orange text-white px-8 py-3 rounded-2xl font-bold hover:bg-simba-orange-dark transition-colors inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="group bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-transparent hover:border-simba-orange/20 hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-600 shadow-sm">
                    <Package className="w-6 h-6 text-simba-orange" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">#{order.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {order.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={`text-sm font-bold capitalize ${
                        order.status === 'completed' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
                    <p className="font-black text-simba-orange">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex -space-x-3 overflow-hidden">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="relative w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-white">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                <button className="flex items-center gap-1 text-xs font-bold text-simba-orange hover:gap-2 transition-all">
                  Order Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
