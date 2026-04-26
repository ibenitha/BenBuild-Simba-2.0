import { redirect } from 'next/navigation';

interface CategoryPageProps {
  params: { locale: string; slug: string };
}

export default function CategoryPage({ params: { locale, slug } }: CategoryPageProps) {
  // Redirect to the products page with category filter
  redirect(`/${locale}/products?category=${slug}`);
}
