import { cn } from "../../utils";
import type { BadgeProps } from "../../types/types";

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-space-600 text-white shadow-space",
    secondary: "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    outline: "border border-neutral-300 text-neutral-700 bg-transparent dark:border-neutral-700 dark:text-neutral-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}