'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { useBranchStore } from '@/store/branch';
import { useOperationsStore } from '@/store/operations';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const t = useTranslations('product');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(s => s.addItem);
  const { selectedBranchId, getSelectedBranch } = useBranchStore();
  const { fetchStock, getBranchStock, stockByBranch } = useOperationsStore();
  
  const branchStock = getBranchStock(selectedBranchId, product.id);
  const currentBranch = getSelectedBranch();
  
  const isOutOfStock = branchStock === 0;
  const isLowStock = branchStock > 0 && branchStock < 5;

  useEffect(() => {
    if (!stockByBranch[selectedBranchId]) {
      fetchStock(selectedBranchId);
    }
  }, [selectedBranchId, fetchStock, stockByBranch]);

  const handleAdd = () => {
    if (isOutOfStock) return;
    for (let i = 0; i < quantity; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Branch Stock Status */}
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          {isOutOfStock ? (
            <XCircle className="w-5 h-5 text-red-500" />
          ) : isLowStock ? (
            <AlertTriangle className="w-5 h-5 text-yellow-500 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
          <div>
            <p className={`text-sm font-bold leading-none ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'}`}>
              {isOutOfStock ? t('outOfStock') : isLowStock ? `Only ${branchStock} left` : t('inStock')}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
              {currentBranch?.name.replace('Simba Supermarket ', '')} Branch
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Quantity selector */}
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={isOutOfStock}
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm hover:bg-simba-orange hover:text-white transition-colors disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className={`font-bold text-lg w-8 text-center ${isOutOfStock ? 'text-slate-400' : ''}`}>{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            disabled={isOutOfStock || quantity >= branchStock}
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm hover:bg-simba-orange hover:text-white transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base transition-all active:scale-95 ${
            added
              ? 'bg-green-500 text-white'
              : 'bg-simba-orange text-white hover:bg-simba-orange-dark'
          } disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-500/10`}
        >
          <ShoppingCart className="w-5 h-5" />
          {added ? `✓ ${t('added')}` : isOutOfStock ? t('outOfStock') : t('addToCart')}
        </button>
      </div>
    </div>
  );
}
