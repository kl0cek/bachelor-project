interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateTaskName = (name?: string): ValidationResult => {
  if (!name?.trim()) {
    return { isValid: false, error: 'Task name is required' };
  }
  return { isValid: true };
};

export const validateTaskForm = (
  formData: { name?: string },
  isRecurring: boolean,
  recurrence?: { type: string; daysOfWeek?: number[] }
): ValidationResult => {
  const nameValidation = validateTaskName(formData.name);
  if (!nameValidation.isValid) return nameValidation;

  if (isRecurring && recurrence?.type === 'weekly') {
    if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) {
      return {
        isValid: false,
        error: 'Please select at least one day of the week for weekly recurrence',
      };
    }
  }

  return { isValid: true };
};
