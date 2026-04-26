import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthSync from '@/components/auth/AuthSync';
import dynamic from 'next/dynamic';

const ConversationalSearch = dynamic(() => import('@/components/products/ConversationalSearch'), {
  ssr: false,
});

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    throw error;
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthSync />
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
          <Navbar locale={locale} />
          <main>{children}</main>
          <Footer locale={locale} />
          <ConversationalSearch locale={locale} />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
