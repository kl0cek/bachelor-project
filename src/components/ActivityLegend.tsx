import type { ActivityCategory } from "../types/types";

export const ActivityLegend = () => {
  const categories: ActivityCategory[] = [
    { name: "Exercise", color: "bg-space-600" },
    { name: "EVA / Spacewalk", color: "bg-orange-500" },
    { name: "Work / Research", color: "bg-space-600" },
    { name: "Optional", color: "bg-neutral-200 border border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700" },
    { name: "Sleep / Meal", color: "bg-neutral-400 dark:bg-neutral-600" },
  ];

  return (
    <div className="mt-8 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg">
      <div className="flex flex-wrap items-center gap-6">
        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Activity Types:
        </p>
        {categories.map((category) => (
          <div key={category.name} className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full shadow-sm ${category.color}`} />
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};