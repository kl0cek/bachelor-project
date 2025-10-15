import { cn } from '../../utils';
import type { BadgeProps } from '../../types/types';

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-space-600 text-white shadow-space',
    secondary: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    outline:
      'border border-slate-300 text-slate-700 bg-transparent dark:border-slate-700 dark:text-slate-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
