import { MetadataRoute } from 'next';
import { products, categories } from '@/lib/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://simba-supermarket.rw';
  const locales = ['en', 'fr', 'rw'];

  const routes = ['', '/auth/login', '/auth/register', '/cart', '/checkout', '/branch-dashboard', '/branch-reviews', '/profile', '/profile/orders', '/profile/wishlist'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
      });
    });

    categories.forEach((category) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    products.forEach((product) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/products/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  });

  return sitemapEntries;
}
