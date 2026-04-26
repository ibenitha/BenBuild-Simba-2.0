import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Simba Supermarket - Rwanda\'s Online Grocery Store',
  description: 'Shop fresh groceries, household essentials and more. Delivered to your door in Rwanda.',
  keywords: 'supermarket, Rwanda, groceries, online shopping, Kigali',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  );
}
