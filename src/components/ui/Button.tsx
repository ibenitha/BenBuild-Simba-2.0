import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-simba-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-simba-green text-white hover:bg-simba-green-dark active:scale-95': variant === 'primary',
            'bg-simba-orange text-white hover:bg-simba-orange-light active:scale-95': variant === 'secondary',
            'border-2 border-simba-green text-simba-green hover:bg-simba-green hover:text-white': variant === 'outline',
            'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800': variant === 'ghost',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export default Button;