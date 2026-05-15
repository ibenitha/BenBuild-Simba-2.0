import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/*/branch-dashboard'],
    },
    sitemap: 'https://simba-supermarket-rwanda.vercel.app/sitemap.xml',
  };
}
