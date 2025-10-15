import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatTime(hour: number): string {
  const hours = Math.floor(hour);
  const minutes = Math.round((hour % 1) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function calculateActivityPosition(
  start: number,
  duration: number,
  totalHours: number = 8,
  startHour: number = 6
) {
  const left = ((start - startHour) / totalHours) * 100;
  const width = (duration / totalHours) * 100;
  return { left, width };
}
