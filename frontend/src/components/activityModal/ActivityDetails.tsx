import { AlertCircle, Wrench, FileText } from 'lucide-react';
import { Badge } from '../ui/index';
import { PDFViewer } from '../PDFViewer/PDFViewer';
import type { Activity } from '../../types/types';

interface ActivityDetailsProps {
  activity: Activity;
}

export const ActivityDetails = ({ activity }: ActivityDetailsProps) => {
  return (
    <>
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

      {activity.pdfUrl && (
        <div className="space-y-3 sm:space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              Attached Document
            </h3>
          </div>
          <PDFViewer pdfUrl={activity.pdfUrl} maxPages={3} />
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
    </>
  );
};
