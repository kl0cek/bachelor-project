import type { RecurrenceConfig } from '../types/types';

export const getRecurrencePreview = (
  recurrence: RecurrenceConfig | undefined,
  missionEndDate?: string
): string => {
  if (!recurrence) return 'Configure recurrence settings above';

  const endDate = recurrence.endDate || missionEndDate;
  const endDateStr = endDate ? new Date(endDate).toLocaleDateString() : 'mission end';

  switch (recurrence.type) {
    case 'daily':
      return `This task will repeat every day until ${endDateStr}`;

    case 'weekly': {
      if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) {
        return 'Please select at least one day of the week';
      }
      const dayNames = recurrence.daysOfWeek
        .sort()
        .map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
        .join(', ');
      return `This task will repeat on ${dayNames} until ${endDateStr}`;
    }

    case 'custom': {
      const interval = recurrence.interval || 2;
      return `This task will repeat every ${interval} days until ${endDateStr}`;
    }

    default:
      return 'Unknown recurrence pattern';
  }
};
