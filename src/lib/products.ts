import { Product } from '@/types';
import { simbaData } from './simba-data';

// Real Simba products from data
export const products: Product[] = simbaData.products.map((p: any) => ({
  id: p.id.toString(),
  name: p.name,
  price: p.price,
  category: p.category,
  categorySlug: getCategorySlug(p.category),
  description: `${p.name} - High quality product from Simba Supermarket`,
  image: p.image,
  inStock: p.inStock,
  unit: p.unit || 'Pcs',
  subcategoryId: p.subcategoryId,
}));

// Helper function to convert category name to slug
function getCategorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Extract unique categories from products
const categoryMap = new Map<string, { name: string; count: number; image: string }>();

products.forEach(product => {
  const existing = categoryMap.get(product.categorySlug);
  if (existing) {
    existing.count++;
  } else {
    categoryMap.set(product.categorySlug, {
      name: product.category,
      count: 1,
      image: product.image, // Use first product image as category image
    });
  }
});

// Real categories from the actual products
export const categories = Array.from(categoryMap.entries()).map(([slug, data], index) => ({
  id: (index + 1).toString(),
  name: data.name,
  slug: slug,
  image: data.image,
  productCount: data.count,
}));

// Search function
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return products;

  const tokens = lowerQuery.split(/\s+/).filter(t => t.length > 0);
  
  return products.filter((p) => {
    const name = p.name.toLowerCase();
    const cat = p.category.toLowerCase();
    const desc = (p.description || '').toLowerCase();

    // Exact match for the full query gets priority
    if (name.includes(lowerQuery) || cat.includes(lowerQuery) || desc.includes(lowerQuery)) {
      return true;
    }

    // Check if ALL tokens are present in name/cat/desc
    return tokens.every(token => 
      name.includes(token) || cat.includes(token) || desc.includes(token)
    );
  });
}

// Get products by category
export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(p => p.categorySlug === categorySlug);
}

// Get category by slug
export function getCategoryBySlug(slug: string) {
  return categories.find(c => c.slug === slug);
}

// Get product by ID
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

// Get featured products (first 12)
export function getFeaturedProducts(): Product[] {
  return products.slice(0, 12);
}

// Get products by price range
export function getProductsByPriceRange(min: number, max: number): Product[] {
  return products.filter(p => p.price >= min && p.price <= max);
}

// Store info
export const storeInfo = {
  name: simbaData.store.name,
  tagline: simbaData.store.tagline,
  location: simbaData.store.location,
  currency: simbaData.store.currency,
};
