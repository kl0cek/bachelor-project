import type { ActivityType } from "../types/types";

export function calculateActivityPosition(
  start: number,
  duration: number,
  minHour: number = 0,
  maxHour: number = 24
) {
  const totalHours = maxHour - minHour;
  const left = ((start - minHour) / totalHours) * 100;
  const width = (duration / totalHours) * 100;
  return { left, width };
}

export function hasTimeConflict(
  activity1: { start: number; duration: number },
  activity2: { start: number; duration: number }
): boolean {
  const end1 = activity1.start + activity1.duration;
  const end2 = activity2.start + activity2.duration;
  return activity1.start < end2 && activity2.start < end1;
}

export function findAvailableTimeSlot(
  activities: { start: number; duration: number }[],
  desiredDuration: number,
  minHour: number = 6,
  maxHour: number = 22
): number | null {
  const sortedActivities = activities.sort((a, b) => a.start - b.start);

  if (sortedActivities.length === 0) {
    return minHour;
  }

  if (sortedActivities[0].start - minHour >= desiredDuration) {
    return minHour;
  }

  for (let i = 0; i < sortedActivities.length - 1; i++) {
    const endCurrent = sortedActivities[i].start + sortedActivities[i].duration;
    const startNext = sortedActivities[i + 1].start;
    const gap = startNext - endCurrent;

    if (gap >= desiredDuration) {
      return endCurrent;
    }
  }

  const lastActivity = sortedActivities[sortedActivities.length - 1];
  const endLast = lastActivity.start + lastActivity.duration;
  if (maxHour - endLast >= desiredDuration) {
    return endLast;
  }

  return null;
}

export function validateActivityTime(
  start: number,
  duration: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (start < 0 || start >= 24) {
    errors.push('Start time must be between 0 and 24 hours');
  }

  if (duration <= 0 || duration > 12) {
    errors.push('Duration must be between 0 and 12 hours');
  }

  if (start + duration > 24) {
    errors.push('Activity cannot extend beyond 24:00');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getActivityColor(type: ActivityType): string {
  const colors: Record<ActivityType, string> = {
    exercise:
      'bg-space-400 dark:bg-space-500 text-sky-950 dark:text-white shadow-space border-space-600 dark:border-space-400',
    meal: 'bg-slate-400 dark:text-gray-900 text-sky-950 dark:bg-slate-500 dark:text-white border-slate-500 dark:border-slate-400',
    sleep:
      'bg-slate-400 dark:text-gray-900 text-sky-950 dark:bg-slate-500 dark:text-white border-slate-500 dark:border-slate-400',
    work: 'bg-space-400 dark:bg-space-500 dark:text-white text-sky-950 shadow-space border-space-600 dark:border-space-400',
    eva: 'bg-orange-400 dark:bg-orange-500 dark:text-gray-900 text-sky-950 dark:text-white shadow-orange border-orange-600 dark:border-orange-400',
    optional:
      'bg-slate-300 text-slate-900 dark:text-white border-slate-400 dark:bg-slate-600 dark:text-slate-100 dark:border-slate-500',
  };

  return colors[type];
}
