'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  User, Mail, Phone, MapPin, ShieldCheck, ChevronRight,
  Loader2, CheckCircle2, AlertCircle, LogOut, Home, Edit3,
  Package, Star
} from 'lucide-react';
import { simbaBranches } from '@/lib/branches';
import { cn } from '@/lib/utils';

const ROLE_CONFIG = {
  customer: { label: 'Customer', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  staff:    { label: 'Branch Staff', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  manager:  { label: 'Branch Manager', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  admin:    { label: 'Administrator', color: 'bg-orange-100 text-simba-orange dark:bg-orange-900/30' },
};

export default function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const { currentUser, logout, refreshUser, initialized } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (initialized && !currentUser) {
      router.push(`/${locale}/auth/login?next=/${locale}/profile`);
    }
  }, [initialized, currentUser, router, locale]);

  // Populate form from current user
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setPhone('');
    }
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save changes.');
        return;
      }

      await refreshUser();
      setSuccess('Profile updated successfully.');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}`);
  };

  if (!initialized || !currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-simba-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleConfig = ROLE_CONFIG[currentUser.role] ?? ROLE_CONFIG.customer;
  const branchName = currentUser.branchId
    ? simbaBranches.find(b => b.id === currentUser.branchId)?.name ?? currentUser.branchId
    : null;
  const initials = (currentUser.fullName || currentUser.email)
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-8">
          <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-simba-orange transition-colors">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-simba-orange">My Profile</span>
        </nav>

        {/* Avatar + name header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-4 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-simba-orange text-white flex items-center justify-center text-2xl font-black flex-shrink-0 shadow-lg shadow-orange-200 dark:shadow-none">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-900 dark:text-white truncate">
              {currentUser.fullName || 'Your Account'}
            </h1>
            <p className="text-sm text-slate-500 truncate">{currentUser.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold', roleConfig.color)}>
                <ShieldCheck className="w-3 h-3" />
                {roleConfig.label}
              </span>
              {branchName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <MapPin className="w-3 h-3" />
                  {branchName.replace('Simba Supermarket ', '')}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-simba-orange text-slate-400 hover:text-simba-orange transition-all flex-shrink-0"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-4">
            <h2 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest mb-5">
              Edit Profile
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); setError(''); }}
                    placeholder="Your full name"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+250 78x xxx xxx"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-simba-orange focus:ring-1 focus:ring-simba-orange transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">Email cannot be changed here.</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-simba-orange hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setError(''); }}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Quick links */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-4">
          <Link
            href={`/${locale}/orders`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-simba-orange" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">My Orders</p>
              <p className="text-xs text-slate-400">View order history and reorder</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </Link>

          <Link
            href={`/${locale}/branch-reviews`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800"
          >
            <div className="w-9 h-9 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
              <Star className="w-4.5 h-4.5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Branch Reviews</p>
              <p className="text-xs text-slate-400">Rate your shopping experience</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </Link>

          {(currentUser.role === 'staff' || currentUser.role === 'manager' || currentUser.role === 'admin') && (
            <Link
              href={`/${locale}/branch-dashboard`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ShieldCheck className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Branch Dashboard</p>
                <p className="text-xs text-slate-400">Manage orders and stock</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>
          )}

          <Link
            href={`/${locale}/auth/forgot-password`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Mail className="w-4.5 h-4.5 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Change Password</p>
              <p className="text-xs text-slate-400">Send a password reset email</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </Link>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

      </div>
    </div>
  );
}
