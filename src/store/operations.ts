import { create } from 'zustand';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export type OrderStatus = 'pending' | 'accepted' | 'ready' | 'dispatched' | 'delivered' | 'completed';

export interface OrderItem {
  productId: string;
  quantity: number;
  name: string;
}

export interface PickupOrder {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  branchId: string;
  timeSlot: string;
  deposit: number;
  items: OrderItem[];
  status: OrderStatus;
  assignedTo?: string;
  createdAt: string;
  // Delivery fields
  orderType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryDistrict?: string;
  deliveryFee?: number;
  totalAmount: number;
}

export interface BranchReview {
  id: string;
  branchId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CustomerFlag {
  id: string;
  customerEmail: string;
  branchId: string;
  orderId: string;
  flagType: 'no_show' | 'late_pickup' | 'rude_behavior' | 'other';
  comment: string;
  createdAt: string;
}

interface OperationsStore {
  // Orders
  orders: PickupOrder[];
  ordersLoading: boolean;
  fetchOrders: (branchId?: string) => Promise<void>;
  placePickupOrder: (order: Omit<PickupOrder, 'id' | 'status' | 'createdAt'>) => Promise<{ id: string } | null>;
  assignOrder: (orderId: string, staffName: string) => Promise<void>;
  markReady: (orderId: string) => Promise<void>;
  dispatchOrder: (orderId: string) => Promise<void>;
  deliverOrder: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;

  // Stock
  stockByBranch: Record<string, Record<string, number>>;
  stockComparison: { branch1: string; branch2: string; data: Record<string, Record<string, number>> } | null;
  fetchStock: (branchId: string) => Promise<void>;
  getBranchStock: (branchId: string, productId: string) => number;
  setOutOfStock: (branchId: string, productId: string) => Promise<void>;
  restockProduct: (branchId: string, productId: string) => Promise<void>;
  updateStock: (branchId: string, productId: string, quantity: number) => Promise<void>;
  fetchStockComparison: (branch1: string, branch2: string) => Promise<void>;
  clearStockComparison: () => void;

  // Reviews
  reviews: BranchReview[];
  reviewsLoading: boolean;
  fetchReviews: (branchId?: string) => Promise<void>;
  addReview: (input: Omit<BranchReview, 'id' | 'createdAt'>) => Promise<void>;

  // Customer Flags
  customerFlags: CustomerFlag[];
  fetchCustomerFlags: (customerEmail?: string) => Promise<void>;
  addCustomerFlag: (input: Omit<CustomerFlag, 'id' | 'createdAt'>) => Promise<void>;
  getCustomerFlagCount: (customerEmail: string) => number;
  getRequiredDeposit: (customerEmail: string) => number;

  subscribeToOrders: (branchId?: string) => () => void;
}

// Helper to map Supabase snake_case rows to camelCase
function mapOrder(row: Record<string, unknown>): PickupOrder {
  const items = (row.order_items as Record<string, unknown>[] | undefined) ?? [];
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    branchId: row.branch_id as string,
    timeSlot: row.time_slot as string,
    deposit: row.deposit as number,
    status: row.status as OrderStatus,
    assignedTo: row.assigned_to as string | undefined,
    createdAt: row.created_at as string,
    orderType: (row.order_type as 'pickup' | 'delivery') || 'pickup',
    deliveryAddress: row.delivery_address as string | undefined,
    deliveryDistrict: row.delivery_district as string | undefined,
    deliveryFee: row.delivery_fee as number | undefined,
    totalAmount: row.total_amount as number || (row.deposit as number),
    items: items.map(i => ({
      productId: i.product_id as string,
      name: i.name as string,
      quantity: i.quantity as number,
    })),
  };
}

function mapReview(row: Record<string, unknown>): BranchReview {
  return {
    id: row.id as string,
    branchId: row.branch_id as string,
    customerName: row.customer_name as string,
    rating: row.rating as number,
    comment: row.comment as string,
    createdAt: row.created_at as string,
  };
}

function mapCustomerFlag(row: Record<string, unknown>): CustomerFlag {
  return {
    id: row.id as string,
    customerEmail: row.customer_email as string,
    branchId: row.branch_id as string,
    orderId: row.order_id as string,
    flagType: row.flag_type as CustomerFlag['flagType'],
    comment: row.comment as string,
    createdAt: row.created_at as string,
  };
}

export const useOperationsStore = create<OperationsStore>()((set, get) => ({
  orders: [],
  ordersLoading: false,
  stockByBranch: {},
  stockComparison: null,
  reviews: [],
  reviewsLoading: false,
  customerFlags: [],

  // ── Orders ──────────────────────────────────────────────────
  fetchOrders: async (branchId) => {
    set({ ordersLoading: true });
    try {
      const url = branchId ? `/api/orders?branchId=${branchId}` : '/api/orders';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ orders: data.map(mapOrder) });
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      set({ ordersLoading: false });
    }
  },

  placePickupOrder: async (order) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          branchId: order.branchId,
          timeSlot: order.timeSlot,
          deposit: order.deposit,
          items: order.items,
          orderType: order.orderType,
          deliveryAddress: order.deliveryAddress,
          deliveryDistrict: order.deliveryDistrict,
          deliveryFee: order.deliveryFee,
          totalAmount: order.totalAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) return null;
      // Optimistically add to local state
      const newOrder: PickupOrder = {
        ...order,
        id: data.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      set({ orders: [newOrder, ...get().orders] });
      return { id: data.id };
    } catch {
      return null;
    }
  },

  assignOrder: async (orderId, staffName) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted', assignedTo: staffName }),
    });
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status: 'accepted', assignedTo: staffName } : o
      ),
    });
  },

  markReady: async (orderId) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ready' }),
    });
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status: 'ready' } : o
      ),
    });
  },

  dispatchOrder: async (orderId) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'dispatched' }),
    });
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status: 'dispatched' } : o
      ),
    });
  },

  deliverOrder: async (orderId) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'delivered' }),
    });
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status: 'delivered' } : o
      ),
    });
  },

  completeOrder: async (orderId) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status: 'completed' } : o
      ),
    });
  },

  // ── Stock ────────────────────────────────────────────────────
  fetchStock: async (branchId) => {
    try {
      const res = await fetch(`/api/stock?branchId=${branchId}`);
      const data = await res.json();
      if (data && typeof data === 'object') {
        set({
          stockByBranch: {
            ...get().stockByBranch,
            [branchId]: data,
          },
        });
      }
    } catch {}
  },

  getBranchStock: (branchId, productId) =>
    get().stockByBranch[branchId]?.[productId] ?? 25,

  setOutOfStock: async (branchId, productId) => {
    await fetch('/api/stock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId, productId, quantity: 0 }),
    });
    set({
      stockByBranch: {
        ...get().stockByBranch,
        [branchId]: {
          ...(get().stockByBranch[branchId] ?? {}),
          [productId]: 0,
        },
      },
    });
  },

  restockProduct: async (branchId, productId) => {
    await fetch('/api/stock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId, productId, quantity: 25 }),
    });
    set({
      stockByBranch: {
        ...get().stockByBranch,
        [branchId]: {
          ...(get().stockByBranch[branchId] ?? {}),
          [productId]: 25,
        },
      },
    });
  },

  updateStock: async (branchId, productId, quantity) => {
    const qty = Math.max(0, Math.round(quantity));
    await fetch('/api/stock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId, productId, quantity: qty }),
    });
    set({
      stockByBranch: {
        ...get().stockByBranch,
        [branchId]: {
          ...(get().stockByBranch[branchId] ?? {}),
          [productId]: qty,
        },
      },
    });
  },

  fetchStockComparison: async (branch1, branch2) => {
    try {
      const res = await fetch(`/api/stock?branchId=${branch1}&branchId2=${branch2}`);
      const data = await res.json();
      if (data && typeof data === 'object') {
        set({
          stockComparison: { branch1, branch2, data },
          stockByBranch: {
            ...get().stockByBranch,
            [branch1]: data[branch1] ?? get().stockByBranch[branch1] ?? {},
            [branch2]: data[branch2] ?? get().stockByBranch[branch2] ?? {},
          },
        });
      }
    } catch {}
  },

  clearStockComparison: () => set({ stockComparison: null }),

  // ── Reviews ──────────────────────────────────────────────────
  fetchReviews: async (branchId) => {
    set({ reviewsLoading: true });
    try {
      const url = branchId ? `/api/reviews?branchId=${branchId}` : '/api/reviews';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ reviews: data.map(mapReview) });
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      set({ reviewsLoading: false });
    }
  },

  addReview: async (input) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId: input.branchId,
        customerName: input.customerName,
        rating: input.rating,
        comment: input.comment,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      set({ reviews: [mapReview(data), ...get().reviews] });
    }
  },

  // ── Customer Flags ──────────────────────────────────────────────
  fetchCustomerFlags: async (customerEmail) => {
    try {
      const url = customerEmail ? `/api/customer-flags?customerEmail=${customerEmail}` : '/api/customer-flags';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ customerFlags: data.map(mapCustomerFlag) });
      }
    } catch {}
  },

  addCustomerFlag: async (input) => {
    const res = await fetch('/api/customer-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerEmail: input.customerEmail,
        branchId: input.branchId,
        orderId: input.orderId,
        flagType: input.flagType,
        comment: input.comment,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      set({ customerFlags: [mapCustomerFlag(data), ...get().customerFlags] });
    }
  },

  getCustomerFlagCount: (customerEmail) => {
    return get().customerFlags.filter(flag => flag.customerEmail === customerEmail).length;
  },

  getRequiredDeposit: (customerEmail) => {
    const flagCount = get().getCustomerFlagCount(customerEmail);
    // Base deposit is 500 RWF, increase by 500 for each flag
    return 500 + (flagCount * 500);
  },

  subscribeToOrders: (branchId?: string) => {
    const supabase = createClient();
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          ...(branchId ? { filter: `branch_id=eq.${branchId}` } : {}),
        },
        async (_payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          // Refresh list when changes happen
          const { fetchOrders } = get();
          await fetchOrders(branchId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
