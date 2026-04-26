'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Something went wrong</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
          We encountered an error while loading this page. This might be due to missing environment variables or a temporary connection issue.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-simba-orange text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-200 dark:shadow-none"
          >
            Try again
          </button>
          <a
            href="/"
            className="block w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
