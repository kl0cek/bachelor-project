import { Plus } from 'lucide-react';
import { getActivityColor } from '../../utils/activityUtils';
import type { Activity } from '../../types/types';

interface TimeSlotProps {
  hour: number;
  activity?: Activity;
  isActivityStart: boolean | undefined;
  onAddTask: (hour: number) => void;
  onViewTask: (activity: Activity) => void;
}

export const TimeSlot = ({
  hour,
  activity,
  isActivityStart,
  onAddTask,
  onViewTask,
}: TimeSlotProps) => {
  const handleClick = () => {
    if (activity) {
      onViewTask(activity);
    } else {
      onAddTask(hour);
    }
  };

  return (
    <td
      className="relative border-r border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
      style={{ height: '60px', minWidth: '60px' }}
      onClick={handleClick}
    >
      {isActivityStart && activity && (
        <div
          className={`absolute inset-0 ${getActivityColor(activity.type)} rounded px-2 py-1 text-xs font-medium text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity pointer-events-none`}
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
    </td>
  );
};
