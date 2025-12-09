import { FORM_STYLES } from '../../constants/formsStyles';

interface WeekdaySelectorProps {
  selectedDays: number[];
  onDayToggle: (day: number) => void;
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

export const WeekdaySelector = ({ selectedDays, onDayToggle }: WeekdaySelectorProps) => {
  return (
    <div className="space-y-2">
      <label className={FORM_STYLES.label}>Repeat on</label>
      <div className="flex flex-wrap gap-2">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => onDayToggle(day.value)}
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
      {selectedDays.length === 0 && (
        <p className="text-xs text-orange-600 dark:text-orange-400">
          Please select at least one day
        </p>
      )}
    </div>
  );
};
