import { cn } from "../../utils";
import type { CardProps } from "../../types/types";

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}