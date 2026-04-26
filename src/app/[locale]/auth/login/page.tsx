'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, Suspense } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') ?? `/${locale}`;

  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return t('emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('emailInvalid');
    if (!password) return t('passwordRequired');
    return null;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.ok) {
      setError(result.message || t('loginFailed'));
      return;
    }

    // Redirect to the next URL (e.g., checkout) or home
    router.push(nextUrl);
  };

  const onGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    const result = await loginWithGoogle(locale);

    if (!result.ok) {
      setGoogleLoading(false);
      setError(result.message || 'Google sign-in failed.');
    }
    // Google OAuth redirects automatically
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
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t('welcomeBack')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('signInSubtitle')}</p>
        </div>

        {/* Show checkout notice if redirected from checkout */}
        {nextUrl.includes('/checkout') && (
          <div className="mb-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 rounded-xl px-4 py-3 text-sm text-orange-700 dark:text-orange-400 text-center font-medium">
            Sign in to complete your order
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full mb-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-3 rounded-xl font-semibold text-sm transition-colors hover:border-simba-orange disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">{t('orContinueWithEmail')}</span>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('email')}</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setError(''); }}
                placeholder="you@example.com"
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('password')}</label>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="text-xs text-slate-400 hover:text-simba-orange transition-colors"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-simba-orange hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t('signingIn') : t('login')}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-sm">
            <span className="text-slate-500">Don&apos;t have an account? </span>
            <Link
              href={`/${locale}/auth/register${nextUrl !== `/${locale}` ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
              className="text-simba-orange font-semibold hover:underline"
            >
              {t('createAccount')}
            </Link>
          </div>
        </div>

        {/* Staff portal link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Are you staff?{' '}
          <Link href={`/${locale}/admin/login`} className="text-simba-orange hover:underline font-medium">
            Sign in to Staff Portal
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-simba-orange border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm locale={locale} />
    </Suspense>
  );
}
