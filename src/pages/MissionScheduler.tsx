import { useParams, Link } from 'react-router';
import { ArrowLeft, Calendar, Users, Settings } from 'lucide-react';
import { TaskProvider } from '../context/TaskProvider';
import { TimelineView, ActivityLegend, ISSStatus } from '../components/index';
import { Button } from '../components/ui/index';
import { getMissionById } from '../mock/mission';

export const MissionScheduler = () => {
  const { id } = useParams<{ id: string }>();
  const mission = id ? getMissionById(id) : null;

  if (!mission) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Mission Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The requested mission could not be found.
          </p>
          <Link to="/">
            <Button>Return to Mission Control</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <TaskProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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

                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Mission {mission.status === 'active' ? 'Active' : mission.status}
                  </span>
                </div>

                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <ISSStatus />
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Mission {mission.status === 'active' ? 'Active' : mission.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Daily Schedule
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage crew activities and mission tasks
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>{mission.crewMembers.length} crew members</span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">UTC Timeline</div>
              </div>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
              <p className="font-medium mb-2">Mission Description:</p>
              <p>{mission.description}</p>
            </div>
          </div>

          <TimelineView />
          <ActivityLegend />
        </main>
      </div>
    </TaskProvider>
  );
};

export default MissionScheduler;
