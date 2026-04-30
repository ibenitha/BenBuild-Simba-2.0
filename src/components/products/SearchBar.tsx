'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SearchBarProps {
  locale: string;
  initialQuery?: string;
}

export default function SearchBar({ locale, initialQuery = '' }: SearchBarProps) {
  const t = useTranslations('nav');
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('search')}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-simba-green focus:border-transparent shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-simba-green text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-simba-green-dark transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
