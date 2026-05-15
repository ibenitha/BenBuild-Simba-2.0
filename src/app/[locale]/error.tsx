'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');
  const params = useParams();
  const locale = params.locale as string || 'en';

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t('errorTitle')}</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        {t('errorDesc')}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 bg-simba-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-simba-orange-dark transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
        >
          <RefreshCcw className="w-4 h-4" />
          {t('tryAgain')}
        </button>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
