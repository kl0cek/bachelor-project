import { cn } from '../../utils/utils';
import type { Activity, Priority } from '../../types/types';

interface PrioritySelectorProps {
  formData: Partial<Activity>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Activity>>>;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'bg-orange-500 dark:text-white text-sky-950' },
  { value: 'medium', label: 'Medium', color: 'bg-sky-600 dark:text-white text-sky-950' },
  {
    value: 'low',
    label: 'Low',
    color: 'bg-slate-400 dark:text-white text-sky-950 dark:bg-slate-600',
  },
];

export const PrioritySelector = ({ formData, setFormData }: PrioritySelectorProps) => {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
        Priority
      </label>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {priorities.map((priority) => (
          <button
            key={priority.value}
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, priority: priority.value }))}
            className={cn(
              'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all',
              formData.priority === priority.value
                ? priority.color
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            )}
          >
            {priority.label}
          </button>
        ))}
      </div>
    </div>
  );
};
