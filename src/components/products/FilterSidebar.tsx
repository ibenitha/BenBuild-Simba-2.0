'use client';

import { useState } from 'react';
import { Filter, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
  categories: string[];
}

export default function FilterSidebar({ onFilterChange, categories }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    onFilterChange({ categories: next, priceRange, inStockOnly });
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    onFilterChange({ categories: selectedCategories, priceRange: [min, max], inStockOnly });
  };

  const handleStockToggle = () => {
    setInStockOnly(!inStockOnly);
    onFilterChange({ categories: selectedCategories, priceRange, inStockOnly: !inStockOnly });
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setInStockOnly(false);
    onFilterChange({ categories: [], priceRange: [0, 100000], inStockOnly: false });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Filter className="w-4 h-4 text-simba-orange" />
          Filters
        </h3>
        {(selectedCategories.length > 0 || inStockOnly || priceRange[0] > 0 || priceRange[1] < 100000) && (
          <button
            onClick={clearAll}
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Categories</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide pr-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="flex items-center gap-2 w-full text-left group"
              >
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  selectedCategories.includes(cat)
                    ? 'bg-simba-orange border-simba-orange text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                  {selectedCategories.includes(cat) && <Check className="w-3 h-3" />}
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  selectedCategories.includes(cat) ? 'text-simba-orange' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                }`}>
                  {cat}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Price Range (RWF)</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(Number(e.target.value), priceRange[1])}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-simba-orange"
                placeholder="Min"
              />
              <span className="text-slate-400">—</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(priceRange[0], Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-simba-orange"
                placeholder="Max"
              />
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(priceRange[0], Number(e.target.value))}
              className="w-full accent-simba-orange h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Availability */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleStockToggle}
            className="flex items-center justify-between w-full group"
          >
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">In Stock Only</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${inStockOnly ? 'bg-simba-orange' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${inStockOnly ? 'left-6' : 'left-1'}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
