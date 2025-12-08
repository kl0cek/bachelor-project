import { useState } from 'react';
import { Repeat, Calendar } from 'lucide-react';
import type { RecurrenceConfig, RecurrenceType } from '../../types/types';

interface RecurrenceSettingsProps {
  isRecurring: boolean;
  recurrence: RecurrenceConfig | undefined;
  missionEndDate?: string;
  onRecurringChange: (isRecurring: boolean) => void;
  onRecurrenceChange: (config: RecurrenceConfig) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const RecurrenceSettings = ({
  isRecurring,
  recurrence,
  missionEndDate,
  onRecurringChange,
  onRecurrenceChange,
}: RecurrenceSettingsProps) => {
  const [useCustomEndDate, setUseCustomEndDate] = useState(!!recurrence?.endDate);

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

  const handleEndDateChange = (endDate: string) => {
    onRecurrenceChange({
      ...recurrence!,
      endDate,
    });
  };

  const handleEndDateTypeChange = (useCustom: boolean) => {
    setUseCustomEndDate(useCustom);
    if (!useCustom) {
      onRecurrenceChange({
        ...recurrence!,
        endDate: undefined,
      });
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isRecurring"
          checked={isRecurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
          className="rounded text-space-600 focus:ring-2 focus:ring-space-500"
        />
        <label
          htmlFor="isRecurring"
          className="text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer flex items-center gap-2"
        >
          <Repeat className="h-4 w-4" />
          Make this a recurring task
        </label>
      </div>

      {isRecurring && (
        <div className="space-y-4 pl-6 border-l-2 border-space-500">
          {/* Recurrence Type */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
              Repeat Pattern
            </label>
            <select
              value={recurrence?.type || 'daily'}
              onChange={(e) => handleTypeChange(e.target.value as RecurrenceType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly (select days)</option>
              <option value="custom">Custom interval</option>
            </select>
          </div>

          {/* Custom Interval */}
          {recurrence?.type === 'custom' && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                Repeat every
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={recurrence?.interval || 2}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">days</span>
              </div>
            </div>
          )}

          {/* Days of Week */}
          {recurrence?.type === 'weekly' && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                Repeat on
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = recurrence?.daysOfWeek?.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-space-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {recurrence?.daysOfWeek?.length === 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Please select at least one day
                </p>
              )}
            </div>
          )}

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ends
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="endOnMission"
                  checked={!useCustomEndDate}
                  onChange={() => handleEndDateTypeChange(false)}
                  className="text-space-600 focus:ring-2 focus:ring-space-500"
                />
                <label
                  htmlFor="endOnMission"
                  className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  On mission end date
                  {missionEndDate && (
                    <span className="ml-1 text-xs text-slate-500">
                      ({new Date(missionEndDate).toLocaleDateString()})
                    </span>
                  )}
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="radio"
                  id="endOnDate"
                  checked={useCustomEndDate}
                  onChange={() => handleEndDateTypeChange(true)}
                  className="text-space-600 focus:ring-2 focus:ring-space-500 mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="endOnDate"
                    className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer block mb-1"
                  >
                    On specific date
                  </label>
                  {useCustomEndDate && (
                    <input
                      type="date"
                      value={recurrence?.endDate || ''}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-space-50 dark:bg-space-900/20 rounded-lg border border-space-200 dark:border-space-800">
            <p className="text-xs font-medium text-space-700 dark:text-space-300">
              📅 Preview: {getRecurrencePreview(recurrence, missionEndDate)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

function getRecurrencePreview(
  recurrence: RecurrenceConfig | undefined,
  missionEndDate?: string
): string {
  if (!recurrence) return 'Configure recurrence settings above';

  const endDate = recurrence.endDate || missionEndDate;
  const endDateStr = endDate ? new Date(endDate).toLocaleDateString() : 'mission end';

  switch (recurrence.type) {
    case 'daily':
      return `This task will repeat every day until ${endDateStr}`;

    case 'weekly':
      if (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) {
        return 'Please select at least one day of the week';
      }
      const dayNames = recurrence.daysOfWeek
        .sort()
        .map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
        .join(', ');
      return `This task will repeat on ${dayNames} until ${endDateStr}`;

    case 'custom':
      const interval = recurrence.interval || 2;
      return `This task will repeat every ${interval} days until ${endDateStr}`;

    default:
      return 'Unknown recurrence pattern';
  }
}
