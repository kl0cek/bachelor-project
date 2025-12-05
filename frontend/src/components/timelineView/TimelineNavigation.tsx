import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/index';

interface TimelineNavigationProps {
  currentDate: string;
  onPrevious: () => void;
  onNext: () => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const TimelineNavigation = ({
  currentDate,
  onPrevious,
  onNext,
  canNavigatePrevious,
  canNavigateNext,
}: TimelineNavigationProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
      <Button variant="outline" size="sm" onClick={onPrevious} disabled={!canNavigatePrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {formatDate(currentDate)}
      </h3>

      <Button variant="outline" size="sm" onClick={onNext} disabled={!canNavigateNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
