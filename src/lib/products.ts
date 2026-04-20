import { Product, Category } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'Fresh Produce', slug: 'fresh-produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80', productCount: 89, color: 'bg-green-100 dark:bg-green-900' },
  { id: '2', name: 'Dairy & Eggs', slug: 'dairy-eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', productCount: 67, color: 'bg-yellow-100 dark:bg-yellow-900' },
  { id: '3', name: 'Meat & Poultry', slug: 'meat-poultry', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80', productCount: 54, color: 'bg-red-100 dark:bg-red-900' },
  { id: '4', name: 'Beverages', slug: 'beverages', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80', productCount: 98, color: 'bg-blue-100 dark:bg-blue-900' },
  { id: '5', name: 'Bakery & Bread', slug: 'bakery-bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', productCount: 45, color: 'bg-amber-100 dark:bg-amber-900' },
  { id: '6', name: 'Snacks & Confectionery', slug: 'snacks-confectionery', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80', productCount: 112, color: 'bg-orange-100 dark:bg-orange-900' },
  { id: '7', name: 'Household & Cleaning', slug: 'household-cleaning', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80', productCount: 88, color: 'bg-cyan-100 dark:bg-cyan-900' },
  { id: '8', name: 'Personal Care', slug: 'personal-care', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80', productCount: 76, color: 'bg-pink-100 dark:bg-pink-900' },
  { id: '9', name: 'Grains & Staples', slug: 'grains-staples', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80', productCount: 93, color: 'bg-stone-100 dark:bg-stone-900' },
  { id: '10', name: 'Frozen Foods', slug: 'frozen-foods', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80', productCount: 67, color: 'bg-indigo-100 dark:bg-indigo-900' },
];

// Sample products - representing 789 products across 10 categories
export const products: Product[] = [
  // Fresh Produce (89 products)
  { id: '1', name: 'Tomatoes', price: 1200, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80', category: 'Fresh Produce', categorySlug: 'fresh-produce', description: 'Fresh ripe tomatoes, locally sourced', unit: '1kg', inStock: true, rating: 4.5, reviews: 89 },
  { id: '2', name: 'Onions', price: 800, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80', category: 'Fresh Produce', categorySlug: 'fresh-produce', description: 'Red onions, fresh from the farm', unit: '1kg', inStock: true, rating: 4.3, reviews: 67 },
  { id: '3', name: 'Carrots', price: 600, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80', category: 'Fresh Produce', categorySlug: 'fresh-produce', description: 'Crunchy fresh carrots', unit: '500g', inStock: true, rating: 4.6, reviews: 54 },
  { id: '4', name: 'Spinach', price: 500, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', category: 'Fresh Produce', categorySlug: 'fresh-produce', description: 'Fresh green spinach leaves', unit: 'bunch', inStock: true, rating: 4.4, reviews: 43 },
  { id: '5', name: 'Avocado', price: 400, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80', category: 'Fresh Produce', categorySlug: 'fresh-produce', description: 'Ripe Hass avocados', unit: 'each', inStock: true, rating: 4.8, reviews: 112 },
  { id: '6', name: 'Bananas', price: 1000, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', category: 'Fresh Produce', categorySlug: 'fresh-produce', description: 'Sweet ripe bananas', unit: 'bunch', inStock: true, rating: 4.7, reviews: 98 },
  { id: '7', name: 'Pineapple', price: 1500, image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80', category: 'Fresh Produce', categorySlug: 'fresh-produce', description: 'Sweet fresh pineapple', unit: 'each', inStock: true, rating: 4.6, reviews: 76 },
  { id: '8', name: 'Mango', price: 600, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80', category: 'Fresh Produce', categorySlug: 'fresh-produce', description: 'Juicy ripe mangoes', unit: 'each', inStock: true, rating: 4.9, reviews: 134 },
  
  // Dairy & Eggs (67 products)
  { id: '100', name: 'Fresh Milk', price: 1500, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', category: 'Dairy & Eggs', categorySlug: 'dairy-eggs', description: 'Fresh pasteurized milk', unit: '1L', inStock: true, rating: 4.7, reviews: 156 },
  { id: '101', name: 'Eggs', price: 3500, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80', category: 'Dairy & Eggs', categorySlug: 'dairy-eggs', description: 'Farm fresh eggs', unit: 'tray of 30', inStock: true, rating: 4.8, reviews: 203 },
  { id: '102', name: 'Cheddar Cheese', price: 4500, image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=80', category: 'Dairy & Eggs', categorySlug: 'dairy-eggs', description: 'Aged cheddar cheese', unit: '250g', inStock: true, rating: 4.6, reviews: 87 },
  { id: '103', name: 'Yogurt', price: 1200, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80', category: 'Dairy & Eggs', categorySlug: 'dairy-eggs', description: 'Natural yogurt', unit: '500g', inStock: true, rating: 4.5, reviews: 92 },
  { id: '104', name: 'Butter', price: 2800, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80', category: 'Dairy & Eggs', categorySlug: 'dairy-eggs', description: 'Salted butter', unit: '250g', inStock: true, rating: 4.7, reviews: 78 },
  
  // Meat & Poultry (54 products)
  { id: '200', name: 'Chicken Breast', price: 5500, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80', category: 'Meat & Poultry', categorySlug: 'meat-poultry', description: 'Fresh chicken breast', unit: '1kg', inStock: true, rating: 4.6, reviews: 145 },
  { id: '201', name: 'Beef Steak', price: 8500, image: 'https://images.unsplash.com/photo-1588347818036-8fc5e6b0c0e0?w=400&q=80', category: 'Meat & Poultry', categorySlug: 'meat-poultry', description: 'Premium beef steak', unit: '500g', inStock: true, rating: 4.8, reviews: 98 },
  { id: '202', name: 'Pork Chops', price: 6500, image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&q=80', category: 'Meat & Poultry', categorySlug: 'meat-poultry', description: 'Fresh pork chops', unit: '1kg', inStock: true, rating: 4.5, reviews: 67 },
  { id: '203', name: 'Whole Chicken', price: 7500, image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80', category: 'Meat & Poultry', categorySlug: 'meat-poultry', description: 'Fresh whole chicken', unit: '1.5kg', inStock: true, rating: 4.7, reviews: 112 },
  
  // Beverages (98 products)
  { id: '300', name: 'Coca Cola', price: 800, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80', category: 'Beverages', categorySlug: 'beverages', description: 'Coca Cola soft drink', unit: '500ml', inStock: true, rating: 4.6, reviews: 234 },
  { id: '301', name: 'Fanta Orange', price: 800, image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&q=80', category: 'Beverages', categorySlug: 'beverages', description: 'Fanta orange soda', unit: '500ml', inStock: true, rating: 4.5, reviews: 189 },
  { id: '302', name: 'Sprite', price: 800, image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80', category: 'Beverages', categorySlug: 'beverages', description: 'Sprite lemon-lime soda', unit: '500ml', inStock: true, rating: 4.5, reviews: 167 },
  { id: '303', name: 'Mineral Water', price: 500, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80', category: 'Beverages', categorySlug: 'beverages', description: 'Pure mineral water', unit: '1.5L', inStock: true, rating: 4.7, reviews: 298 },
  { id: '304', name: 'Orange Juice', price: 2500, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80', category: 'Beverages', categorySlug: 'beverages', description: 'Fresh orange juice', unit: '1L', inStock: true, rating: 4.8, reviews: 156 },
  
  // Bakery & Bread (45 products)
  { id: '400', name: 'White Bread', price: 1200, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', category: 'Bakery & Bread', categorySlug: 'bakery-bread', description: 'Fresh white bread', unit: 'loaf', inStock: true, rating: 4.5, reviews: 178 },
  { id: '401', name: 'Whole Wheat Bread', price: 1500, image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80', category: 'Bakery & Bread', categorySlug: 'bakery-bread', description: 'Healthy whole wheat bread', unit: 'loaf', inStock: true, rating: 4.6, reviews: 134 },
  { id: '402', name: 'Croissants', price: 2500, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', category: 'Bakery & Bread', categorySlug: 'bakery-bread', description: 'Butter croissants', unit: 'pack of 6', inStock: true, rating: 4.8, reviews: 98 },
  { id: '403', name: 'Baguette', price: 1000, image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80', category: 'Bakery & Bread', categorySlug: 'bakery-bread', description: 'French baguette', unit: 'each', inStock: true, rating: 4.7, reviews: 87 },
  
  // Snacks & Confectionery (112 products)
  { id: '500', name: 'Potato Chips', price: 1500, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80', category: 'Snacks & Confectionery', categorySlug: 'snacks-confectionery', description: 'Crispy potato chips', unit: '150g', inStock: true, rating: 4.5, reviews: 267 },
  { id: '501', name: 'Chocolate Bar', price: 1200, image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&q=80', category: 'Snacks & Confectionery', categorySlug: 'snacks-confectionery', description: 'Milk chocolate bar', unit: '100g', inStock: true, rating: 4.7, reviews: 312 },
  { id: '502', name: 'Cookies', price: 2000, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80', category: 'Snacks & Confectionery', categorySlug: 'snacks-confectionery', description: 'Assorted cookies', unit: '200g', inStock: true, rating: 4.6, reviews: 198 },
  { id: '503', name: 'Peanuts', price: 1800, image: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400&q=80', category: 'Snacks & Confectionery', categorySlug: 'snacks-confectionery', description: 'Roasted peanuts', unit: '250g', inStock: true, rating: 4.5, reviews: 145 },
  
  // Household & Cleaning (88 products)
  { id: '600', name: 'Laundry Detergent', price: 4500, image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&q=80', category: 'Household & Cleaning', categorySlug: 'household-cleaning', description: 'Powerful laundry detergent', unit: '1kg', inStock: true, rating: 4.6, reviews: 234 },
  { id: '601', name: 'Dish Soap', price: 1500, image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80', category: 'Household & Cleaning', categorySlug: 'household-cleaning', description: 'Liquid dish soap', unit: '500ml', inStock: true, rating: 4.5, reviews: 189 },
  { id: '602', name: 'Toilet Paper', price: 3500, image: 'https://images.unsplash.com/photo-1584556326561-c8746083993b?w=400&q=80', category: 'Household & Cleaning', categorySlug: 'household-cleaning', description: 'Soft toilet paper', unit: 'pack of 12', inStock: true, rating: 4.7, reviews: 267 },
  { id: '603', name: 'Floor Cleaner', price: 2500, image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80', category: 'Household & Cleaning', categorySlug: 'household-cleaning', description: 'Multi-surface floor cleaner', unit: '1L', inStock: true, rating: 4.6, reviews: 156 },
  
  // Personal Care (76 products)
  { id: '700', name: 'Shampoo', price: 3500, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80', category: 'Personal Care', categorySlug: 'personal-care', description: 'Moisturizing shampoo', unit: '400ml', inStock: true, rating: 4.6, reviews: 198 },
  { id: '701', name: 'Toothpaste', price: 1500, image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80', category: 'Personal Care', categorySlug: 'personal-care', description: 'Whitening toothpaste', unit: '100ml', inStock: true, rating: 4.7, reviews: 234 },
  { id: '702', name: 'Body Lotion', price: 4500, image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&q=80', category: 'Personal Care', categorySlug: 'personal-care', description: 'Hydrating body lotion', unit: '250ml', inStock: true, rating: 4.8, reviews: 167 },
  { id: '703', name: 'Soap Bar', price: 800, image: 'https://images.unsplash.com/photo-1588016522410-ab5b3b8e3f1f?w=400&q=80', category: 'Personal Care', categorySlug: 'personal-care', description: 'Antibacterial soap', unit: '100g', inStock: true, rating: 4.5, reviews: 145 },
  
  // Grains & Staples (93 products)
  { id: '800', name: 'White Rice', price: 3500, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', category: 'Grains & Staples', categorySlug: 'grains-staples', description: 'Premium white rice', unit: '2kg', inStock: true, rating: 4.7, reviews: 298 },
  { id: '801', name: 'Pasta', price: 2500, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80', category: 'Grains & Staples', categorySlug: 'grains-staples', description: 'Italian pasta', unit: '500g', inStock: true, rating: 4.6, reviews: 178 },
  { id: '802', name: 'Flour', price: 2000, image: 'https://images.unsplash.com/photo-1628672734097-5c29c0f0e4e6?w=400&q=80', category: 'Grains & Staples', categorySlug: 'grains-staples', description: 'All-purpose flour', unit: '1kg', inStock: true, rating: 4.5, reviews: 156 },
  { id: '803', name: 'Sugar', price: 1800, image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&q=80', category: 'Grains & Staples', categorySlug: 'grains-staples', description: 'White sugar', unit: '1kg', inStock: true, rating: 4.6, reviews: 189 },
  
  // Frozen Foods (67 products)
  { id: '900', name: 'Frozen Peas', price: 2500, image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80', category: 'Frozen Foods', categorySlug: 'frozen-foods', description: 'Frozen green peas', unit: '500g', inStock: true, rating: 4.5, reviews: 134 },
  { id: '901', name: 'Ice Cream', price: 4500, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', category: 'Frozen Foods', categorySlug: 'frozen-foods', description: 'Vanilla ice cream', unit: '1L', inStock: true, rating: 4.8, reviews: 267 },
  { id: '902', name: 'Frozen Pizza', price: 5500, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', category: 'Frozen Foods', categorySlug: 'frozen-foods', description: 'Margherita pizza', unit: '400g', inStock: true, rating: 4.6, reviews: 198 },
  { id: '903', name: 'Frozen Fish', price: 6500, image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&q=80', category: 'Frozen Foods', categorySlug: 'frozen-foods', description: 'Frozen tilapia fillets', unit: '500g', inStock: true, rating: 4.7, reviews: 145 },
];

// Helper functions
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(slug: string): Product[] {
  return products.filter(p => p.categorySlug === slug);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.description.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}
