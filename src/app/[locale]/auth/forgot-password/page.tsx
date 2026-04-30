'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, MailCheck } from 'lucide-react';

export default function ForgotPasswordPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 mb-3">
            <Image
              src="/simba-logo.png"
              alt="Simba Supermarket"
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t('forgotPassword')}</h1>
          <p className="text-sm text-slate-500 mt-1 text-center max-w-xs">{t('forgotDemoNote')}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MailCheck className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Check your inbox</h2>
              <p className="text-sm text-slate-500 mb-5">{t('resetSent', { email })}</p>
              <Link
                href={`/${locale}/auth/login`}
                className="inline-block bg-simba-orange text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-simba-orange-dark transition-colors"
              >
                {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('email')}</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-simba-orange hover:bg-simba-orange-dark text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Sending…' : t('sendResetLink')}
              </button>

              <div className="text-center">
                <Link href={`/${locale}/auth/login`} className="text-sm text-slate-500 hover:text-simba-orange transition-colors">
                  {t('backToLogin')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
