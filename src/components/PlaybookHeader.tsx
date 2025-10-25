import { Link } from 'react-router';
import { ArrowLeft, Calendar } from 'lucide-react';
import { ISSStatus } from '../components/index';
import type { Mission, MissionStatus } from '../types/types';

interface PlaybookHeaderProps {
  mission: Mission;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const statusStyles: Record<MissionStatus, string> = {
  active:
    'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
  completed:
    'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  planning:
    'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
  cancelled:
    'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
};

export const PlaybookHeader = ({ mission }: PlaybookHeaderProps) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Mission Control</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-space-100 dark:bg-space-900">
                <Calendar className="h-6 w-6 text-space-600 dark:text-space-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {mission.name}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(mission.startDate)} - {formatDate(mission.endDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <ISSStatus />
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border ${statusStyles[mission.status]}`}
              >
                <div
                  className={`h-2 w-2 rounded-full animate-pulse ${mission.status === 'active' ? 'bg-green-500' : mission.status === 'completed' ? 'bg-blue-500' : mission.status === 'planning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                />
                <span className="text-sm font-medium">
                  Mission {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <ISSStatus />
            <div className="flex items-center gap-4">
              <div
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border ${statusStyles[mission.status]}`}
              >
                <div
                  className={`h-2 w-2 rounded-full animate-pulse ${mission.status === 'active' ? 'bg-green-500' : mission.status === 'completed' ? 'bg-blue-500' : mission.status === 'planning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                />
                <span className="text-sm font-medium">
                  Mission {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
