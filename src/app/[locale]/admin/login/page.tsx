'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AdminLoginPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('adminLogin');
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return t('emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('emailInvalid');
    if (!password) return t('passwordRequired');
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.ok) {
      setError(result.message || t('loginFailed'));
      return;
    }

    // Check role after login
    const { currentUser } = useAuthStore.getState();
    const staffRoles = ['staff', 'manager', 'admin'];

    if (!currentUser || !staffRoles.includes(currentUser.role)) {
      // Not a staff member — sign them out and show error
      await useAuthStore.getState().logout();
      setError(t('accessDenied'));
      return;
    }

    // Redirect to branch dashboard
    router.push(`/${locale}/branch-dashboard`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-simba-orange rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-orange-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('title')}</h1>
          <p className="text-sm text-slate-400 mt-1">{t('subtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          {/* Access notice */}
          <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-800/40 rounded-xl px-4 py-3 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400 leading-relaxed">
              {t('notice')}
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {t('workEmail')}
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder={t('workEmailPlaceholder')}
                className="w-full border border-slate-700 rounded-xl px-4 py-3 bg-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full border border-slate-700 rounded-xl px-4 py-3 pr-11 bg-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-simba-orange hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t('signingIn') : t('signInCta')}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-800 flex items-center justify-between text-sm">
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-slate-500 hover:text-simba-orange transition-colors text-xs"
            >
              {t('forgotPassword')}
            </Link>
            <Link
              href={`/${locale}`}
              className="text-slate-500 hover:text-slate-300 transition-colors text-xs"
            >
              ← {t('customerSite')}
            </Link>
          </div>
        </div>

        {/* Role info */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { role: t('roleStaff'), desc: t('roleStaffDesc'), color: 'text-blue-400' },
            { role: t('roleManager'), desc: t('roleManagerDesc'), color: 'text-purple-400' },
            { role: t('roleAdmin'), desc: t('roleAdminDesc'), color: 'text-simba-orange' },
          ].map(item => (
            <div key={item.role} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <p className={`text-xs font-black uppercase tracking-widest ${item.color}`}>{item.role}</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
