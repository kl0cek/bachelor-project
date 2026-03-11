import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Users, Loader2, AlertCircle, Video, Calendar } from 'lucide-react';
import { TimelineView, ActivityLegend, PlaybookHeader } from '../components/index';
import { Button } from '../components/ui/index';
import { useMissions } from '../hooks/useMissions';
import type { Mission } from '../types/types';

export const MissionScheduler = () => {
  const { id } = useParams<{ id: string }>();
  const { getMissionById } = useMissions();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goToTodayFn, setGoToTodayFn] = useState<(() => void) | null>(null);
  const [isTodayAvailable, setIsTodayAvailable] = useState(false);

  useEffect(() => {
    const loadMission = async () => {
      if (!id) {
        setError('Mission ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const missionData = await getMissionById(id);
        setMission(missionData);
      } catch (err) {
        console.error('Error loading mission:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load mission';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadMission();
  }, [id]);

  const handleTodayAvailable = (goToToday: () => void, isAvailable: boolean) => {
    setGoToTodayFn(() => goToToday);
    setIsTodayAvailable(isAvailable);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-space-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading mission...</p>
        </div>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Mission Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'The requested mission could not be found.'}
          </p>
          <Link to="/">
            <Button>Return to Mission Control</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
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
                <span>{mission.crewMembers?.length || 0} crew members</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-start text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
            <div>
              <p className="font-medium mb-2">Mission Description:</p>
              <p>{mission.description}</p>
            </div>
            <div className="flex flex-row items-end gap-2">
              {isTodayAvailable && goToTodayFn && (
                <Button variant="outline" className="flex items-center gap-2" onClick={goToTodayFn}>
                  <Calendar className="h-4 w-4" />
                  Go to Today
                </Button>
              )}
              <Link to={`/mission/${mission.id}/video-call`}>
                <Button className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Join Video Call
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <TimelineView mission={mission} onTodayAvailable={handleTodayAvailable} />
        <ActivityLegend />
      </main>
    </div>
  );
};

export default MissionScheduler;
