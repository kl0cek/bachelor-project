import type { ActivityCategory } from '../types/types';

export const ActivityLegend = () => {
  const categories: ActivityCategory[] = [
    { name: 'Exercise', color: 'bg-space-600', type: 'exercise' },
    { name: 'EVA / Spacewalk', color: 'bg-orange-500', type: 'eva' },
    { name: 'Work / Research', color: 'bg-space-600', type: 'work' },
    {
      name: 'Optional',
      color: 'bg-slate-200 border border-slate-300 dark:bg-slate-800 dark:border-slate-700',
      type: 'optional',
    },
    { name: 'Sleep / Meal', color: 'bg-slate-400 dark:bg-slate-600', type: 'sleep' },
  ];

  return (
    <div className="mt-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="flex flex-wrap items-center gap-6">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Activity Types:</p>
        {categories.map((category) => (
          <div key={category.name} className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full shadow-sm ${category.color}`} />
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
