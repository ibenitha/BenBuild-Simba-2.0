import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCategoryBySlug, getProductsByCategory } from '@/lib/products';
import ProductGrid from '@/components/products/ProductGrid';

interface CategoryPageProps {
  params: { locale: string; slug: string };
}

export default function CategoryPage({ params: { locale, slug } }: CategoryPageProps) {
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const products = getProductsByCategory(slug);

  return (
    <div>
      {/* Category hero */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <Image src={category.image} alt={category.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{category.name}</h1>
            <p className="text-white/80 mt-2">{products.length} products available</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid products={products} locale={locale} emptyMessage={`No products in ${category.name} yet`} />
      </div>
    </div>
  );
}