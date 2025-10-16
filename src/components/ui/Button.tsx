import { cn } from '../../utils/utils';
import type { ButtonProps } from '../../types/types';

export function Button({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ButtonProps) {
  const variants = {
    default: 'bg-space-600 text-white hover:bg-space-700 shadow-space focus:ring-space-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300',
    outline:
      'border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-900 dark:text-slate-300',
  };

  const sizes = {
    default: 'h-11 px-6 py-2 rounded-xl text-sm font-medium',
    icon: 'h-11 w-11 rounded-xl flex items-center justify-center',
    sm: 'h-9 px-4 text-sm rounded-lg',
    lg: 'h-13 px-8 text-base rounded-2xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
