import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cart';
import { Product } from '@/types';

const mockProduct: Product = {
  id: 'p1',
  name: 'Test Product',
  price: 1000,
  originalPrice: 1200,
  category: 'Test Category',
  categorySlug: 'test-category',
  description: 'Test Description',
  inStock: true,
};

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should add an item to the cart', () => {
    useCartStore.getState().addItem(mockProduct);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].product.id).toBe('p1');
    expect(state.items[0].quantity).toBe(1);
  });

  it('should increase quantity if item already in cart', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('should remove an item from the cart', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().removeItem('p1');
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it('should calculate total correctly', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem({ ...mockProduct, id: 'p2', price: 500 });
    const total = useCartStore.getState().total();
    expect(total).toBe(1500);
  });

  it('should calculate savings correctly', () => {
    useCartStore.getState().addItem(mockProduct); // Save 200
    const savings = useCartStore.getState().savings();
    expect(savings).toBe(200);
  });
});
