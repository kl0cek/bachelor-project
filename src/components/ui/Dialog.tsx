import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/utils';
import type {
  DialogProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogTitleProps,
} from '../../types/types';

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DialogContent({ className, children }: DialogContentProps) {
  return (
    <motion.div
      className={cn(
        'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 rounded-2xl p-8 shadow-2xl relative max-w-lg w-full mx-4 border border-slate-200 dark:border-slate-800',
        className
      )}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-6">{children}</div>;
}

export function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <h2 className={cn('text-2xl font-semibold text-slate-900 dark:text-slate-100', className)}>
      {children}
    </h2>
  );
}
