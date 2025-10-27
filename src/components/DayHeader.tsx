import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from './ui/index';
import type { Mission } from '../types/types';

interface DayHeaderProps {
  currentDate: Date;
  missionDay: number;
  mission?: Mission;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onDateSelect: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export const DayHeader = ({
  currentDate,
  missionDay,
  mission,
  onPreviousDay,
  onNextDay,
  onDateSelect,
  canGoPrevious,
  canGoNext,
}: DayHeaderProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTotalMissionDays = () => {
    if (!mission) return 0;
    const start = new Date(mission.startDate);
    const end = new Date(mission.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const getDayOfYear = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    return dayOfYear;
  };

  return (
    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousDay}
            disabled={!canGoPrevious}
            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
            title="Previous day"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-w-0 overflow-x-auto scrollbar-hide">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-space-600 dark:text-space-400 shrink-0" />
            <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
              <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatDate(currentDate)}
              </span>
              <span className="text-slate-400 dark:text-slate-600 hidden xs:inline">/</span>
              <span className="text-sm sm:text-lg font-bold text-space-600 dark:text-space-400 hidden xs:inline">
                D{missionDay}/{getTotalMissionDays()}
              </span>
              <span className="text-slate-400 dark:text-slate-600 hidden md:inline">/</span>
              <span className="text-sm sm:text-lg font-bold text-slate-500 dark:text-slate-400 hidden md:inline">
                Day {getDayOfYear(currentDate)}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNextDay}
            disabled={!canGoNext}
            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
            title="Next day"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onDateSelect} 
          className="hidden sm:flex shrink-0"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Select Date
        </Button>
      </div>
    </div>
  );
};
