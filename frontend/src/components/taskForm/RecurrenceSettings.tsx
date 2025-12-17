import { Repeat } from 'lucide-react';
import { FORM_STYLES } from '../../constants/formsStyles';
import {
  RecurrenceTypeSelector,
  CustomIntervalSelector,
  WeekdaySelector,
  EndDateSelector,
  RecurrencePreview,
} from './index';
import type { RecurrenceConfig, RecurrenceType } from '../../types/types';

interface RecurrenceSettingsProps {
  isRecurring: boolean;
  recurrence: RecurrenceConfig | undefined;
  missionEndDate?: string;
  onRecurringChange: (isRecurring: boolean) => void;
  onRecurrenceChange: (config: RecurrenceConfig) => void;
}

export const RecurrenceSettings = ({
  isRecurring,
  recurrence,
  missionEndDate,
  onRecurringChange,
  onRecurrenceChange,
}: RecurrenceSettingsProps) => {
  const handleTypeChange = (type: RecurrenceType) => {
    const newConfig: RecurrenceConfig = {
      ...recurrence,
      type,
      interval: type === 'custom' ? recurrence?.interval || 2 : undefined,
      daysOfWeek: type === 'weekly' ? recurrence?.daysOfWeek || [1, 2, 3, 4, 5] : undefined,
    };
    onRecurrenceChange(newConfig);
  };

  const handleIntervalChange = (interval: number) => {
    onRecurrenceChange({
      ...recurrence!,
      interval,
    });
  };

  const handleDayToggle = (day: number) => {
    const currentDays = recurrence?.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();

    onRecurrenceChange({
      ...recurrence!,
      daysOfWeek: newDays,
    });
  };

  const handleEndDateChange = (endDate?: string) => {
    onRecurrenceChange({
      ...recurrence!,
      endDate,
    });
  };

  return (
    <div className={FORM_STYLES.container}>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isRecurring"
          checked={isRecurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
          className={FORM_STYLES.checkbox}
        />
        <label
          htmlFor="isRecurring"
          className={`${FORM_STYLES.label} cursor-pointer flex items-center gap-2`}
        >
          <Repeat className="h-4 w-4" />
          Make this a recurring task
        </label>
      </div>

      {isRecurring && (
        <div className="space-y-4 pl-6 border-l-2 border-space-500">
          <RecurrenceTypeSelector value={recurrence?.type || 'daily'} onChange={handleTypeChange} />

          {recurrence?.type === 'custom' && (
            <CustomIntervalSelector
              interval={recurrence?.interval || 2}
              onIntervalChange={handleIntervalChange}
            />
          )}

          {recurrence?.type === 'weekly' && (
            <WeekdaySelector
              selectedDays={recurrence?.daysOfWeek || []}
              onDayToggle={handleDayToggle}
            />
          )}

          <EndDateSelector
            endDate={recurrence?.endDate}
            missionEndDate={missionEndDate}
            onEndDateChange={handleEndDateChange}
          />

          <RecurrencePreview recurrence={recurrence} missionEndDate={missionEndDate} />
        </div>
      )}
    </div>
  );
};
