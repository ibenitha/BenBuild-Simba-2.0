import { useTranslations } from 'next-intl';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

interface ProductGridProps {
  products: Product[];
  locale: string;
  emptyMessage?: string;
  loading?: boolean;
}

export default function ProductGrid({
  products,
  locale,
  emptyMessage,
  loading = false
}: ProductGridProps) {
  const t = useTranslations('product');

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-slate-500 dark:text-slate-400 text-lg">{emptyMessage ?? t('noProducts')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {products.map(product => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
