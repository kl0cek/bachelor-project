import type { ActivityType } from '../types/types';

export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const msInDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / msInDay) + 1;
}

export function formatDate(
  date: Date = new Date(),
  format: 'DD.MM.YYYY' | 'YYYY-MM-DD' | 'MMM DD, YYYY' = 'DD.MM.YYYY'
): string {
  switch (format) {
    case 'DD.MM.YYYY': {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }
    case 'YYYY-MM-DD':
      return date.toISOString().split('T')[0];
    case 'MMM DD, YYYY':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    default:
      return date.toLocaleDateString();
  }
}

export function formatTime(hour: number): string {
  const hours = Math.floor(hour);
  const minutes = Math.round((hour % 1) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function parseTimeToHour(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + minutes / 60;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

export function isValidDateString(dateString: string): boolean {
  return !isNaN(Date.parse(dateString));
}

export function toUTCString(date: Date): string {
  return date.toISOString();
}

export function fromUTCString(utcString: string): Date {
  return new Date(utcString);
}

export const getActivityColor = (type: ActivityType): string => {
  const colors: Record<ActivityType, string> = {
    exercise: 'bg-space-400 dark:bg-sky-800 text-sky-950 dark:text-white',
    meal: 'bg-slate-400 dark:bg-slate-500 text-sky-950 dark:text-white',
    sleep: 'bg-slate-400 dark:bg-slate-500 text-sky-950 dark:text-white',
    work: 'bg-sky-800 dark:bg-sky-800 text-sky-950 dark:text-white',
    eva: 'bg-orange-400 dark:bg-orange-500 text-sky-950 dark:text-white',
    optional: 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white',
  };
  return colors[type];
};
