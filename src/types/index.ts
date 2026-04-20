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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  color: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Locale = 'en' | 'fr' | 'rw';
