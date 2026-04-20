import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'orange' | 'red' | 'gray';
  className?: string;
}

export default function Badge({ children, variant = 'green', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': variant === 'green',
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200': variant === 'orange',
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': variant === 'red',
        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300': variant === 'gray',
      },
      className
    )}>
      {children}
    </span>
  );
}