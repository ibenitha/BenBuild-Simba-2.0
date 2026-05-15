import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import ProductClient from '@/components/products/ProductClient';

interface ProductPageProps {
  params: { locale: string; id: string };
}

export async function generateMetadata({ params: { id } }: ProductPageProps): Promise<Metadata> {
  const product = getProductById(id);
  if (!product) return {};

  return {
    title: `${product.name} | Simba Supermarket Rwanda`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default function ProductPage({ params: { locale, id } }: ProductPageProps) {
  const product = getProductById(id);
  if (!product) notFound();

  return (
    <ProductClient product={product} locale={locale} id={id} />
  );
}
