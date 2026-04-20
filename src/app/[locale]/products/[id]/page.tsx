import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, products } from '@/lib/products';
import { Star, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductGrid from '@/components/products/ProductGrid';

interface ProductPageProps {
  params: { locale: string; id: string };
}

export default function ProductPage({ params: { locale, id } }: ProductPageProps) {
  const product = getProductById(id);
  if (!product) notFound();

  const related = products
    .filter(p => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href={`/${locale}`} className="hover:text-simba-green transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/${locale}/category/${product.categorySlug}`} className="hover:text-simba-green transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-xl bg-red-500 px-6 py-2 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <Link href={`/${locale}/category/${product.categorySlug}`} className="text-simba-green text-sm font-medium hover:underline mb-2">
            {product.category}
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">{product.name}</h1>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">{product.rating} ({product.reviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-bold text-simba-green">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xl text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {product.unit && (
            <p className="text-slate-500 text-sm mb-4">Unit: <span className="font-medium text-slate-700 dark:text-slate-300">{product.unit}</span></p>
          )}

          {/* Stock status */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium w-fit mb-6 ${product.inStock ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
            <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </div>

          {/* Description */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Description</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Add to cart */}
          <AddToCartButton product={product} />

          {/* Back link */}
          <Link href={`/${locale}/category/${product.categorySlug}`} className="flex items-center gap-2 text-slate-500 hover:text-simba-green transition-colors text-sm mt-4">
            <ArrowLeft className="w-4 h-4" />
            Back to {product.category}
          </Link>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">You might also like</h2>
          <ProductGrid products={related} locale={locale} />
        </section>
      )}
    </div>
  );
}