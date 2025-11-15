import { Clock } from 'lucide-react';
import { Badge } from '../ui/index';
import type { ActivityType } from '../../types/types';

interface ActivityTimeInfoProps {
  startTime: string;
  endTime: string;
  type: ActivityType;
}

const typeLabels: Record<ActivityType, string> = {
  exercise: 'Exercise',
  meal: 'Meal',
  sleep: 'Sleep',
  work: 'Work',
  eva: 'EVA',
  optional: 'Optional',
};

export const ActivityTimeInfo = ({ startTime, endTime, type }: ActivityTimeInfoProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
      <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 shrink-0" />
        <span className="text-slate-900 dark:text-slate-100 font-semibold">
          {startTime} - {endTime} UTC
        </span>
      </div>
      <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 w-fit">
        {typeLabels[type]}
      </Badge>
    </div>
  );
};
