import { Dialog, DialogContent, DialogHeader } from '../ui/index';
import { ActivityHeader, ActivityTimeInfo, ActivityDetails, CommentsSection } from './index';
import { formatTime } from '../../utils/dateUtils';
import type { Activity } from '../../types/types';

interface ActivityModalProps {
  activity: Activity | null;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
}

export const ActivityModal = ({ activity, onClose, onEdit }: ActivityModalProps) => {
  if (!activity) return null;

  const startTime = formatTime(activity.start);
  const endTime = formatTime(activity.start + activity.duration);

  const handleEdit = () => {
    onEdit(activity);
  };

  return (
    <Dialog open={!!activity} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <ActivityHeader activity={activity} onEdit={handleEdit} />
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 md:space-y-8 pt-4 sm:pt-6">
          <ActivityTimeInfo startTime={startTime} endTime={endTime} type={activity.type} />

          <ActivityDetails activity={activity} />

          <CommentsSection activityId={activity.id} />

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
