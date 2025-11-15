import type { Activity, ActivityType } from '../../types/types';

interface TaskFormBasicFieldsProps {
  formData: Partial<Activity>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Activity>>>;
  defaultStartTime: number;
}

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: 'work', label: 'Work / Research' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'eva', label: 'EVA / Spacewalk' },
  { value: 'meal', label: 'Meal' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'optional', label: 'Optional' },
];

export const TaskFormBasicFields = ({
  formData,
  setFormData,
  defaultStartTime,
}: TaskFormBasicFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
          Task Name *
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
          placeholder="Enter task name"
          required
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
          Mission
        </label>
        <input
          type="text"
          value={formData.mission || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, mission: e.target.value }))}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
          placeholder="Mission name"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
          Start Time (UTC)
        </label>
        <input
          type="number"
          min="0"
          max="23.75"
          step="0.25"
          value={formData.start || defaultStartTime}
          onChange={(e) => setFormData((prev) => ({ ...prev, start: parseFloat(e.target.value) }))}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
          Duration (hours)
        </label>
        <input
          type="number"
          min="0.25"
          max="12"
          step="0.25"
          value={formData.duration || 1}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, duration: parseFloat(e.target.value) }))
          }
          className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
          Activity Type
        </label>
        <select
          value={formData.type || 'work'}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, type: e.target.value as ActivityType }))
          }
          className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-space-500 focus:border-transparent"
        >
          {activityTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
