'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

export default function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fullName.trim() || fullName.trim().length < 2) return 'Full name must be at least 2 characters.';
    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];
  const pwLabels = ['', 'Weak', 'Fair', 'Strong'];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    const result = await register({ fullName: fullName.trim(), email: email.trim(), password });
    setLoading(false);
    if (!result.ok) { setError(result.message || t('registrationFailed')); return; }
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Join thousands of Kigali shoppers</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('fullName')}</label>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={e => { setFullName(e.target.value); setError(''); }}
                placeholder="Jean-Pierre Habimana"
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Min. 6 characters"
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength ? pwColors[pwStrength] : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{pwLabels[pwStrength]}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Perks */}
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3 space-y-1.5">
              {['Free pick-up at 9 Kigali branches', 'Track your orders in real time', 'Pay with MoMo or card'].map(perk => (
                <div key={perk} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-simba-orange flex-shrink-0" />
                  {perk}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-simba-orange hover:bg-simba-orange-dark text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account…' : t('createAccount')}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-sm">
            <Link href={`/${locale}/auth/login`} className="text-simba-orange font-semibold hover:underline">
              {t('alreadyHaveAccount')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
