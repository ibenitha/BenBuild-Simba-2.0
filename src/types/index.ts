export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categorySlug: string;
  description: string;
  unit?: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  subcategoryId?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Locale = 'en' | 'fr' | 'rw';

// ── User Roles ────────────────────────────────────────────────
export type UserRole = 'customer' | 'staff' | 'manager' | 'admin';

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId?: string; // For staff/manager: which branch they belong to
  avatarUrl?: string;
}

// ── Auth ──────────────────────────────────────────────────────
export interface AuthResult {
  ok: boolean;
  message?: string;
}

// ── Staff / Admin ─────────────────────────────────────────────
export interface StaffProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
  createdAt: string;
}
