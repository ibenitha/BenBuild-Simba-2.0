import { Skeleton } from "../ui/Skeleton";

export default function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 p-3 space-y-3">
      {/* Image placeholder */}
      <Skeleton className="aspect-square w-full rounded-xl" />
      
      {/* Category placeholder */}
      <Skeleton className="h-3 w-1/3" />
      
      {/* Title placeholder */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* Unit placeholder */}
      <Skeleton className="h-3 w-1/4" />
      
      {/* Price and Button placeholder */}
      <div className="flex items-end justify-between pt-2">
        <div className="space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}
