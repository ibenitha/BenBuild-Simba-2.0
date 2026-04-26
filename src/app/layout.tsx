import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Simba Supermarket - Rwanda\'s Online Grocery Store',
  description: 'Shop fresh groceries, household essentials and more. Delivered to your door in Rwanda.',
  keywords: 'supermarket, Rwanda, groceries, online shopping, Kigali',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F97316',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`}>{children}</body>
    </html>
  );
}
