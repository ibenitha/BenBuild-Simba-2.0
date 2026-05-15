'use client';

import { useOrderStore } from '@/store/orders';
import { Package, Truck, CheckCircle2, Clock, MapPin, Phone, CreditCard, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Reveal, fadeIn, scaleIn } from '@/lib/animations';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function OrderTrackingPage({ params: { locale, id } }: { params: { locale: string, id: string } }) {
  const { getOrderById } = useOrderStore();
  const order = getOrderById(id);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Order Not Found</h1>
        <p className="text-slate-500 mt-2">We couldn&apos;t find an order with ID: #{id}</p>
      </div>
    );
  }

  const steps = [
    { status: 'pending', label: 'Order Placed', icon: Clock, desc: 'We have received your order.' },
    { status: 'preparing', label: 'Preparing', icon: Package, desc: 'Your items are being packed.' },
    { status: 'ready', label: 'Ready', icon: CheckCircle2, desc: 'Your order is ready for delivery/pickup.' },
    { status: 'completed', label: 'Delivered', icon: Truck, desc: 'Enjoy your fresh groceries!' },
  ];

  const currentStepIdx = steps.findIndex(s => s.status === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span>Tracking</span>
            </nav>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-slate-500 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className={`p-2 rounded-xl ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-simba-orange'}`}>
              {order.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
              <p className="font-black text-slate-800 dark:text-slate-100 capitalize">{order.status}</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Progress Tracker */}
      <section className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-8 sm:p-12 shadow-sm mb-8">
        <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-[26px] left-[5%] right-[5%] h-1 bg-slate-100 dark:bg-slate-800 hidden md:block">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
              className="h-full bg-simba-orange"
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isActive = idx === currentStepIdx;
            return (
              <div key={step.status} className="relative z-10 flex md:flex-col items-center gap-4 md:text-center md:flex-1">
                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
                    isCompleted ? 'bg-simba-orange text-white shadow-orange-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-300'
                  } ${isActive ? 'ring-4 ring-orange-100 dark:ring-orange-950/50' : ''}`}
                >
                  <step.icon className="w-7 h-7" />
                </motion.div>
                <div>
                  <p className={`font-bold text-sm ${isCompleted ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 md:max-w-[120px] mx-auto">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Details */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
          <h2 className="font-black text-xl text-slate-800 dark:text-slate-100 mb-6">Order Details</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-500">{item.quantity} x {formatPrice(item.product.price)}</p>
                </div>
                <p className="font-bold text-simba-orange text-sm">{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-800 dark:text-slate-100 font-black">Total</span>
                <span className="text-simba-orange font-black">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Customer & Delivery */}
        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="font-black text-xl text-slate-800 dark:text-slate-100 mb-6">Delivery Information</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Address</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                    {order.deliveryDetails.address}, {order.deliveryDetails.district}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{order.deliveryDetails.phone}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Method</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 capitalize">{order.paymentMethod}</p>
                </div>
              </div>
            </div>
          </section>

          <Link
            href={`/${locale}`}
            className="block w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-3xl font-bold text-center hover:bg-simba-orange transition-all shadow-lg"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
