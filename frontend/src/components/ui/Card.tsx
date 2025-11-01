import { cn } from '../../utils/utils';
import type { CardProps } from '../../types/types';

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
