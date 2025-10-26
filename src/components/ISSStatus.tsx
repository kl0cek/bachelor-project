import { Satellite, Clock, AlertCircle } from 'lucide-react';
import { useISS } from '../hooks/useISS';
import { cn } from '../utils/utils';
import { getVisibilityIcon, getVisibilityText } from '../utils/issUtils';
import { getDayOfYear, formatDate } from '../utils/dateUtils';

export const ISSStatus = () => {
  const { data, loading, error } = useISS(30000);
  const currentDate = new Date();
  const dayOfYear = getDayOfYear(currentDate);
  const formattedDate = formatDate(currentDate);

  if (loading && !data) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <Satellite className="h-4 w-4 text-slate-500 dark:text-slate-400 animate-pulse" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Loading ISS data...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
        <AlertCircle className="h-4 w-4 text-orange-500" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
            ISS Data Unavailable
          </span>
        </div>
      </div>
    );
  }

  const visibilityColor =
    data?.visibility === 'daylight'
      ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
      : 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300';

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
            {formattedDate}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Day {dayOfYear} of {currentDate.getFullYear()}
          </span>
        </div>
      </div>

      {data && (
        <div className={cn('flex items-center gap-3 px-4 py-2 rounded-xl border', visibilityColor)}>
          <div className="flex items-center gap-2">
            <span className="text-sm">{getVisibilityIcon(data.visibility)}</span>
            <Satellite className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">ISS {getVisibilityText(data.visibility)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
