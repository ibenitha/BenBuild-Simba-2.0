'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, Suspense } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') ?? `/${locale}`;

  const register = useAuthStore((state) => state.register);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const validate = () => {
    if (!fullName.trim() || fullName.trim().length < 2) return t('nameMinLength');
    if (!email.trim()) return t('emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('emailInvalid');
    if (password.length < 6) return t('passwordMinLength');
    return null;
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];
  const pwLabels = ['', 'Weak', 'Fair', 'Strong'];

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const result = await register({ fullName: fullName.trim(), email: email.trim(), password });
    setLoading(false);

    if (!result.ok) {
      setError(result.message || t('registrationFailed'));
      return;
    }

    router.push(nextUrl);
  };

  const onGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    const result = await loginWithGoogle(locale);

    if (!result.ok) {
      setGoogleLoading(false);
      setError(result.message || t('googleSignInFailed'));
    }
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
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t('createAccount')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('createAccountSubtitle')}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full mb-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-3 rounded-xl font-semibold text-sm transition-colors hover:border-simba-orange disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {googleLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {googleLoading ? t('redirecting') : t('continueWithGoogle')}
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('fullName')}</label>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setError('');
                }}
                placeholder={t('namePlaceholder')}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('email')}</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError('');
                }}
                placeholder={t('emailPlaceholder')}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  placeholder={t('passwordMinPlaceholder')}
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
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-colors ${index <= pwStrength ? pwColors[pwStrength] : 'bg-slate-200 dark:bg-slate-700'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{t(`password${pwLabels[pwStrength]}`)}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3 space-y-1.5">
              {[
                t('perkPickup'),
                t('perkTrack'),
                t('perkPay'),
              ].map((perk) => (
                <div key={perk} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-simba-orange flex-shrink-0" />
                  {perk}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-simba-orange hover:bg-simba-orange-dark text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t('creatingAccount') : t('createAccount')}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-sm">
            <Link href={`/${locale}/auth/login${nextUrl !== `/${locale}` ? `?next=${encodeURIComponent(nextUrl)}` : ''}`} className="text-simba-orange font-semibold hover:underline">
              {t('alreadyHaveAccount')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-simba-orange border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterForm locale={locale} />
    </Suspense>
  );
}
