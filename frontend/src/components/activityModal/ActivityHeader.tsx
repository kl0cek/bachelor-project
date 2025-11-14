import { Edit3 } from 'lucide-react';
import { DialogTitle, Button, Badge } from '../ui/index';
import { cn } from '../../utils/utils';
import type { Activity, Priority } from '../../types/types';

interface ActivityHeaderProps {
  activity: Activity;
  onEdit: () => void;
}

const priorityColors: Record<Exclude<Priority, undefined>, string> = {
  high: 'bg-orange-500 text-gray shadow-orange',
  medium: 'bg-sky-600 text-gray shadow-space',
  low: 'bg-slate-400 text-gray dark:bg-slate-600',
};

export const ActivityHeader = ({ activity, onEdit }: ActivityHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-3 sm:gap-6">
      <div className="flex-1 min-w-0">
        <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-slate-900 dark:text-slate-100 wrap-break-word">
          {activity.name}
        </DialogTitle>
        {activity.mission && (
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium truncate">
            {activity.mission}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {activity.priority && (
          <Badge
            className={cn(
              'text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2',
              priorityColors[activity.priority]
            )}
          >
            {activity.priority.toUpperCase()}
          </Badge>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
          title="Edit task"
        >
          <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
};
