'use client';

import { useTranslations } from 'next-intl';
import { categories } from '@/lib/products';
import { X } from 'lucide-react';

interface FilterPanelProps {
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  inStockOnly: boolean;
  onInStockChange: (v: boolean) => void;
  onClear: () => void;
}

export default function FilterPanel({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  inStockOnly,
  onInStockChange,
  onClear,
}: FilterPanelProps) {
  const t = useTranslations('filter');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t('title')}</h3>
        <button onClick={onClear} className="text-xs text-slate-400 hover:text-simba-orange flex items-center gap-1 transition-colors">
          <X className="w-3 h-3" /> {t('clear')}
        </button>
      </div>

      {/* Category filter */}
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('category')}</p>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-simba-orange text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCategory === cat.slug ? 'bg-simba-orange text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t('price')}: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} RWF
        </p>
        <input
          type="range"
          min={0}
          max={50000}
          step={500}
          value={priceRange[1]}
          onChange={e => onPriceChange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-simba-orange"
        />
      </div>

      {/* In stock */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={e => onInStockChange(e.target.checked)}
          className="w-4 h-4 accent-simba-orange rounded"
        />
        <span className="text-sm text-slate-700 dark:text-slate-300">{t('inStock')}</span>
      </label>
    </div>
  );
}
