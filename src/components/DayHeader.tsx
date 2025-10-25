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
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousDay}
          disabled={!canGoPrevious}
          className="h-9 w-9"
          title="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Calendar className="h-4 w-4 text-space-600 dark:text-space-400" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatDate(currentDate)}
              </span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-lg font-bold text-space-600 dark:text-space-400">
                Day {missionDay} of {getTotalMissionDays()}
              </span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-lg font-bold text-slate-500 dark:text-slate-400">
                Day {getDayOfYear(currentDate)}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNextDay}
          disabled={!canGoNext}
          className="h-9 w-9"
          title="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onDateSelect}
        className="hidden sm:flex"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Select Date
      </Button>
    </div>
  );
};
