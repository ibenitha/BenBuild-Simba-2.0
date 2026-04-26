'use client';

import Link from 'next/link';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-950/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Access Denied
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          You don&apos;t have permission to access this page. This area is restricted to authorized staff members.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 bg-simba-orange text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href={`/${locale}/admin/login`}
            className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl font-bold text-sm hover:border-simba-orange hover:text-simba-orange transition-colors"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
}
