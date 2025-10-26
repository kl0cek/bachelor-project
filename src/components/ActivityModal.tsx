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
    high: 'bg-orange-500 text-white shadow-orange',
    medium: 'bg-space-600 text-white shadow-space',
    low: 'bg-slate-400 text-white dark:bg-slate-600',
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                {activity.name}
              </DialogTitle>
              {activity.mission && (
                <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
                  {activity.mission}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activity.priority && (
                <Badge
                  className={cn('shrink-0 text-sm px-4 py-2', priorityColors[activity.priority])}
                >
                  {activity.priority.toUpperCase()}
                </Badge>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleEdit}
                className="shrink-0"
                title="Edit task"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-base">
              <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                {startTime} - {endTime} UTC
              </span>
            </div>
            <Badge variant="outline" className="text-sm px-4 py-2">
              {typeLabels[activity.type]}
            </Badge>
          </div>

          {activity.description && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Description
                </h3>
              </div>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                {activity.description}
              </p>
            </div>
          )}

          {activity.equipment && activity.equipment.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Equipment Required
                </h3>
              </div>
              <div className="flex flex-wrap gap-3 pl-8">
                {activity.equipment.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Duration:{' '}
                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                  {activity.duration} hours
                </span>
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-500">ID: {activity.id}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
