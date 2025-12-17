import { useState } from 'react';
import type { Activity, RecurrenceConfig } from '../types/types';

export const useRecurrence = (task?: Activity | null) => {
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false);
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | undefined>(
    task?.recurrence || {
      type: 'daily',
      interval: 1,
    }
  );

  const validateRecurrence = (): { isValid: boolean; error?: string } => {
    if (!isRecurring) return { isValid: true };

    if (
      recurrence?.type === 'weekly' &&
      (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0)
    ) {
      return {
        isValid: false,
        error: 'Please select at least one day of the week for weekly recurrence',
      };
    }

    return { isValid: true };
  };

  return {
    isRecurring,
    recurrence,
    setIsRecurring,
    setRecurrence,
    validateRecurrence,
  };
};
