import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products } from '@/lib/products';

export type Role = 'manager' | 'staff';
export type OrderStatus = 'pending' | 'accepted' | 'ready' | 'completed';

export interface PickupOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  branchId: string;
  timeSlot: string;
  deposit: number;
  items: Array<{ productId: string; quantity: number; name: string }>;
  status: OrderStatus;
  assignedTo?: string;
  createdAt: string;
}

export interface BranchReview {
  id: string;
  branchId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface OperationsStore {
  stockByBranch: Record<string, Record<string, number>>;
  orders: PickupOrder[];
  reviews: BranchReview[];
  seedBranchStock: (branchIds: string[]) => void;
  getBranchStock: (branchId: string, productId: string) => number;
  placePickupOrder: (order: Omit<PickupOrder, 'id' | 'status' | 'createdAt'>) => PickupOrder;
  assignOrder: (orderId: string, staffName: string) => void;
  markReady: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  setOutOfStock: (branchId: string, productId: string) => void;
  addReview: (input: Omit<BranchReview, 'id' | 'createdAt'>) => void;
}

export const useOperationsStore = create<OperationsStore>()(
  persist(
    (set, get) => ({
      stockByBranch: {},
      orders: [],
      reviews: [],
      seedBranchStock: (branchIds) => {
        const current = { ...get().stockByBranch };
        branchIds.forEach((branchId) => {
          if (!current[branchId]) {
            current[branchId] = {};
            products.forEach((product) => {
              current[branchId][product.id] = 25;
            });
          }
        });
        set({ stockByBranch: current });
      },
      getBranchStock: (branchId, productId) => get().stockByBranch[branchId]?.[productId] ?? 0,
      placePickupOrder: (order) => {
        const created: PickupOrder = {
          ...order,
          id: `SB-${Date.now().toString().slice(-7)}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        const nextStock = { ...get().stockByBranch };
        if (!nextStock[order.branchId]) {
          nextStock[order.branchId] = {};
        }
        order.items.forEach((item) => {
          const current = nextStock[order.branchId][item.productId] ?? 25;
          nextStock[order.branchId][item.productId] = Math.max(0, current - item.quantity);
        });
        set({ orders: [created, ...get().orders], stockByBranch: nextStock });
        return created;
      },
      assignOrder: (orderId, staffName) => {
        set({
          orders: get().orders.map((order) =>
            order.id === orderId ? { ...order, assignedTo: staffName, status: 'accepted' } : order
          ),
        });
      },
      markReady: (orderId) => {
        set({
          orders: get().orders.map((order) => (order.id === orderId ? { ...order, status: 'ready' } : order)),
        });
      },
      completeOrder: (orderId) => {
        set({
          orders: get().orders.map((order) => (order.id === orderId ? { ...order, status: 'completed' } : order)),
        });
      },
      setOutOfStock: (branchId, productId) => {
        const nextStock = { ...get().stockByBranch };
        if (!nextStock[branchId]) {
          nextStock[branchId] = {};
        }
        nextStock[branchId][productId] = 0;
        set({ stockByBranch: nextStock });
      },
      addReview: (input) => {
        const review: BranchReview = {
          ...input,
          id: `RV-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toISOString(),
        };
        set({ reviews: [review, ...get().reviews] });
      },
    }),
    { name: 'simba-ops' }
  )
);
