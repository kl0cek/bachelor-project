import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { subtractDays, formatDate } from './dateUtils';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const missionUtils = {
  calculateMissionDay(missionStartDate: string, currentDate: Date = new Date()): number {
    const start = new Date(missionStartDate);
    const diffTime = currentDate.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  },

  getMissionDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  isMissionActive(startDate: string, endDate: string, currentDate: Date = new Date()): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return currentDate >= start && currentDate <= end;
  },

  getMissionProgress(startDate: string, endDate: string, currentDate: Date = new Date()): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const total = end.getTime() - start.getTime();
    const elapsed = currentDate.getTime() - start.getTime();

    if (elapsed < 0) return 0;
    if (elapsed > total) return 100;

    return Math.round((elapsed / total) * 100);
  },

  getPreviousMissionDay(missionStartDate: string, currentDate: Date): Date {
    const prevDay = subtractDays(currentDate, 1);
    const missionStart = new Date(missionStartDate);
    return prevDay >= missionStart ? prevDay : missionStart;
  },
};

export const validationUtils = {
  isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isStrongPassword(password: string): { isStrong: boolean; suggestions: string[] } {
    const suggestions: string[] = [];

    if (password.length < 8) {
      suggestions.push('Use at least 8 characters');
    }

    if (!/[a-z]/.test(password)) {
      suggestions.push('Include lowercase letters');
    }

    if (!/[A-Z]/.test(password)) {
      suggestions.push('Include uppercase letters');
    }

    if (!/\d/.test(password)) {
      suggestions.push('Include numbers');
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      suggestions.push('Include special characters');
    }

    return {
      isStrong: suggestions.length === 0,
      suggestions,
    };
  },

  isValidUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    if (username.length > 20) {
      errors.push('Username must be less than 20 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  },
};

export const formatUtils = {
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    }

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
  },

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(date, 'MMM DD, YYYY');
  },

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) return `${count} ${singular}`;
    return `${count} ${plural || singular + 's'}`;
  },
};

export const storageUtils = {
  setItem(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

export const urlUtils = {
  buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return searchParams.toString();
  },

  parseQueryString(queryString: string): Record<string, string> {
    const params = new URLSearchParams(queryString);
    const result: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
      result[key] = value;
    }

    return result;
  },
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
