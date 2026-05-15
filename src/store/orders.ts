'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryDetails: {
    name: string;
    phone: string;
    address: string;
    district: string;
  };
  paymentMethod: string;
  type: 'delivery' | 'pickup';
  branchId?: string;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getUserOrders: (userId: string) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      updateOrderStatus: (orderId, status) => set({
        orders: get().orders.map(o => o.id === orderId ? { ...o, status } : o)
      }),
      getUserOrders: (userId) => get().orders.filter(o => o.userId === userId),
      getOrderById: (orderId) => get().orders.find(o => o.id === orderId),
    }),
    { name: 'simba-orders' }
  )
);
