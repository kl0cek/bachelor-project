import { createContext } from 'react';
import type { ToastType } from '../types/types';

interface ToastContextValue {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
