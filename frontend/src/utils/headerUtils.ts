import type { MissionStatus } from '../types/types';

export const statusStyles: Record<MissionStatus, string> = {
  active:
    'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
  completed:
    'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  planning:
    'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
  cancelled:
    'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
};

export const getStatusColor = (status: MissionStatus) => {
  const colors = {
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    planning: 'bg-yellow-500',
    cancelled: 'bg-red-500',
  };
  return colors[status];
};
