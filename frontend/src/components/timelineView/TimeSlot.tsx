import { Plus } from 'lucide-react';
import { getActivityColor } from '../../utils/activityUtils';
import type { Activity } from '../../types/types';

interface TimeSlotProps {
  hour: number;
  activity?: Activity;
  isActivityStart: boolean | undefined;
  onAddTask: (hour: number) => void;
  onViewTask: (activity: Activity) => void;
  showCurrentHourIndicator?: boolean;
}

export const TimeSlot = ({
  hour,
  activity,
  isActivityStart,
  onAddTask,
  onViewTask,
  showCurrentHourIndicator = false,
}: TimeSlotProps) => {
  const handleClick = () => {
    if (activity) {
      onViewTask(activity);
    } else {
      onAddTask(hour);
    }
  };

  return (
    <div
      className="relative h-full w-full hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
      onClick={handleClick}
    >
      {isActivityStart && activity && (
        <div
          className={`absolute inset-0 ${getActivityColor(activity.type)} rounded px-2 py-1 text-xs font-medium text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity pointer-events-none z-10`}
          style={{
            width: `calc(${activity.duration * 100}% - 2px)`,
          }}
          title={activity.name}
        >
          <div className="truncate">{activity.name}</div>
        </div>
      )}

      {!activity && (
        <button
          className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onAddTask(hour);
          }}
        >
          <Plus className="h-4 w-4 text-slate-400" />
        </button>
      )}

      {showCurrentHourIndicator && (
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-red-600 dark:bg-red-500 z-50 pointer-events-none" />
      )}
    </div>
  );
};
