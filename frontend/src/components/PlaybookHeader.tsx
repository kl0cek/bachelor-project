import { Link } from 'react-router';
import { ArrowLeft, Calendar } from 'lucide-react';
import { ISSStatus } from '../components/index';
import type { Mission } from '../types/types';
import { formatDate } from '../utils/dateUtils';

interface PlaybookHeaderProps {
  mission: Mission;
}

export const PlaybookHeader = ({ mission }: PlaybookHeaderProps) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-8 min-w-0 flex-1">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline text-sm">Back</span>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
              <div className="p-2 sm:p-3 rounded-xl bg-space-100 dark:bg-space-900 shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-space-600 dark:text-space-400" />
              </div>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                  {mission.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                  <span className="hidden sm:inline">
                    {formatDate(mission.startDate)} - {formatDate(mission.endDate)}
                  </span>
                  <span className="sm:hidden">
                    {formatDate(mission.startDate, 'short')} -{' '}
                    {formatDate(mission.endDate, 'short')}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
            <div className="hidden lg:block">
              <ISSStatus mission={mission} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
