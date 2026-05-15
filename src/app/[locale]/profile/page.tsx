'use client';

import { useAuthStore } from '@/store/auth';
import { User, Mail, Shield, CheckCircle2 } from 'lucide-react';

export default function ProfileInfo() {
  const { currentUser } = useAuthStore();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Personal Information</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3 h-3" /> Full Name
          </label>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-200">
            {currentUser?.fullName}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Mail className="w-3 h-3" /> Email Address
          </label>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between">
            {currentUser?.email}
            <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-2 h-2" /> Verified
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800/30 flex gap-4">
        <div className="w-12 h-12 bg-white dark:bg-blue-900/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100 dark:border-blue-800">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-blue-900 dark:text-blue-300">Security Note</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
            Your personal information is stored securely. We never share your data with third parties.
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <button className="bg-simba-orange text-white px-8 py-3 rounded-2xl font-bold hover:bg-simba-orange-dark transition-colors">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
