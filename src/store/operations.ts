import { create } from 'zustand';

export type OrderStatus = 'pending' | 'accepted' | 'ready' | 'completed';

export interface OrderItem {
  productId: string;
  quantity: number;
  name: string;
}

export interface PickupOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  branchId: string;
  timeSlot: string;
  deposit: number;
  items: OrderItem[];
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
  // Orders
  orders: PickupOrder[];
  ordersLoading: boolean;
  fetchOrders: (branchId?: string) => Promise<void>;
  placePickupOrder: (order: Omit<PickupOrder, 'id' | 'status' | 'createdAt'>) => Promise<{ id: string } | null>;
  assignOrder: (orderId: string, staffName: string) => Promise<void>;
  markReady: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;

  // Stock
  stockByBranch: Record<string, Record<string, number>>;
  fetchStock: (branchId: string) => Promise<void>;
  getBranchStock: (branchId: string, productId: string) => number;
  setOutOfStock: (branchId: string, productId: string) => Promise<void>;

  // Reviews
  reviews: BranchReview[];
  reviewsLoading: boolean;
  fetchReviews: (branchId?: string) => Promise<void>;
  addReview: (input: Omit<BranchReview, 'id' | 'createdAt'>) => Promise<void>;
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

export const useOperationsStore = create<OperationsStore>()((set, get) => ({
  orders: [],
  ordersLoading: false,
  stockByBranch: {},
  reviews: [],
  reviewsLoading: false,

  // ── Orders ──────────────────────────────────────────────────
  fetchOrders: async (branchId) => {
    set({ ordersLoading: true });
    try {
      const url = branchId ? `/api/orders?branchId=${branchId}` : '/api/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ orders: data.map(mapOrder) });
      }
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

  // ── Reviews ──────────────────────────────────────────────────
  fetchReviews: async (branchId) => {
    set({ reviewsLoading: true });
    try {
      const url = branchId ? `/api/reviews?branchId=${branchId}` : '/api/reviews';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ reviews: data.map(mapReview) });
      }
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
}));
