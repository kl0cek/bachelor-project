import { Clock, AlertCircle, Wrench, Edit3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Badge } from './ui/index';
import { cn } from '../utils/utils';
import { formatTime } from '../utils/dateUtils';
import type { Activity, Priority, ActivityType } from '../types/types';

interface ActivityModalProps {
  activity: Activity | null;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
}

export const ActivityModal = ({ activity, onClose, onEdit }: ActivityModalProps) => {
  if (!activity) return null;

  const startTime = formatTime(activity.start);
  const endTime = formatTime(activity.start + activity.duration);

  const priorityColors: Record<Exclude<Priority, undefined>, string> = {
    high: 'bg-orange-500 text-gray shadow-orange',
    medium: 'bg-space-600 text-gray shadow-space',
    low: 'bg-slate-400 text-gray dark:bg-slate-600',
  };

  const typeLabels: Record<ActivityType, string> = {
    exercise: 'Exercise',
    meal: 'Meal',
    sleep: 'Sleep',
    work: 'Work',
    eva: 'EVA',
    optional: 'Optional',
  };

  const handleEdit = () => {
    onEdit(activity);
  };

  return (
    <Dialog open={!!activity} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl">
        <DialogHeader>
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
                  className={cn('text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2', priorityColors[activity.priority])}
                >
                  {activity.priority.toUpperCase()}
                </Badge>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleEdit}
                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                title="Edit task"
              >
                <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 md:space-y-8 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                {startTime} - {endTime} UTC
              </span>
            </div>
            <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 w-fit">
              {typeLabels[activity.type]}
            </Badge>
          </div>

          {activity.description && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Description
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed pl-6 sm:pl-8">
                {activity.description}
              </p>
            </div>
          )}

          {activity.equipment && activity.equipment.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Equipment Required
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 pl-6 sm:pl-8">
                {activity.equipment.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Duration:{' '}
                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                  {activity.duration} hours
                </span>
              </p>
              <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 truncate">
                ID: {activity.id}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
