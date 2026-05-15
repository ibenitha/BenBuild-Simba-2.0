'use client';

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 h-full">
      <Skeleton className="aspect-square w-full mb-4" />
      <Skeleton className="h-3 w-1/3 mb-2" />
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-3 w-1/4 mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-8 w-1/4 rounded-xl" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 h-full">
       <Skeleton className="w-16 h-16 rounded-2xl mb-4 mx-auto" />
       <Skeleton className="h-5 w-3/4 mb-2 mx-auto" />
       <Skeleton className="h-3 w-1/2 mx-auto" />
    </div>
  );
}
