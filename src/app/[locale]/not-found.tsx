'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShoppingBag, Home, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function NotFound() {
  const t = useTranslations('error');
  const params = useParams();
  const locale = params.locale as string || 'en';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-12 h-12 text-simba-orange" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('notFoundTitle')}</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        {t('notFoundDesc')}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center gap-2 bg-simba-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-simba-orange-dark transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
        >
          <Home className="w-4 h-4" />
          {t('backHome')}
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('goBack')}
        </button>
      </div>
    </div>
  );
}
