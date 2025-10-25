import { useParams, Link } from 'react-router';
import { Users } from 'lucide-react';
import { TaskProvider } from '../context/TaskProvider';
import { TimelineView, ActivityLegend, PlaybookHeader } from '../components/index';
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

  return (
    <TaskProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <PlaybookHeader mission={mission} />

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
