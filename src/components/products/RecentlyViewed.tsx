'use client';

import { useRecentlyViewedStore } from '@/store/recentlyViewed';
import ProductCard from './ProductCard';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RecentlyViewedProps {
  locale: string;
  excludeId?: string;
}

export default function RecentlyViewed({ locale, excludeId }: RecentlyViewedProps) {
  const t = useTranslations('product');
  const items = useRecentlyViewedStore(s => s.items).filter(p => p.id !== excludeId);

  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-simba-orange" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('recentlyViewed')}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {items.slice(0, 5).map(product => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}
