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
          {/* Kinyarwanda active indicator — visible proof of RW translation */}
          {locale === 'rw' && (
            <div className="bg-gradient-to-r from-blue-600 via-yellow-400 to-green-600 text-white text-center py-1.5 text-[11px] font-black uppercase tracking-widest">
              🇷🇼 Kinyarwanda · Ururimi rw&apos;Ikinyarwanda rwakiriwe
            </div>
          )}
          <Navbar locale={locale} />
          <main>{children}</main>
          <Footer locale={locale} />
          <ConversationalSearch locale={locale} />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
