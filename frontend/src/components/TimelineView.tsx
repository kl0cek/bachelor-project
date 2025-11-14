import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { Button } from './ui/index';
import { TaskForm } from './TaskForm';
import { ActivityModal } from './ActivityModal';
import { useActivities } from '../hooks/useActivities';
import { getActivityColor } from '../utils/activityUtils';
import type { Mission, Activity } from '../types/types';

interface TimelineViewProps {
  mission: Mission;
}

export const TimelineView = ({ mission }: TimelineViewProps) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    const missionStart = new Date(mission.startDate);
    const missionEnd = new Date(mission.endDate);

    if (today >= missionStart && today <= missionEnd) {
      return today.toISOString().split('T')[0];
    }
    return missionStart.toISOString().split('T')[0];
  });

  const { activities, setActivities, loading, createActivity, updateActivity, deleteActivity } =
    useActivities(mission.id, currentDate);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Activity | null>(null);
  const [selectedCrewMemberId, setSelectedCrewMemberId] = useState<string>('');
  const [defaultStartTime, setDefaultStartTime] = useState<number>(6);
  const [viewingTask, setViewingTask] = useState<Activity | null>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const crewMembers = mission.crewMembers || [];

  const getActivitiesForCrewMember = (crewMemberId: string) => {
    return activities.filter((activity) => activity.crewMemberId === crewMemberId);
  };

  const handlePreviousDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    const missionStart = new Date(mission.startDate);
    if (date >= missionStart) {
      setCurrentDate(date.toISOString().split('T')[0]);
    }
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    const missionEnd = new Date(mission.endDate);
    if (date <= missionEnd) {
      setCurrentDate(date.toISOString().split('T')[0]);
    }
  };

  const handleAddTask = (crewMemberId: string, startTime: number) => {
    setSelectedCrewMemberId(crewMemberId);
    setDefaultStartTime(startTime);
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Activity) => {
    setSelectedTask(task);
    setSelectedCrewMemberId(task.crewMemberId!);
    setIsFormOpen(true);
  };

  const handleViewTask = (task: Activity) => {
    setViewingTask(task);
  };

  const handleFormSubmit = async (taskData: Activity): Promise<Activity | void> => {
    if (!taskData.crewMemberId) {
      console.error('Crew member ID is required');
      return;
    }

    try {
      if (selectedTask) {
        const updated = await updateActivity(selectedTask.id!, {
          crew_member_id: taskData.crewMemberId,
          mission_id: mission.id,
          name: taskData.name,
          date: currentDate,
          start_hour: taskData.start,
          duration: taskData.duration,
          type: taskData.type,
          priority: taskData.priority,
          mission: taskData.mission,
          description: taskData.description,
          equipment: taskData.equipment,
        });
        return updated;
      } else {
        const newActivity = await createActivity({
          crew_member_id: taskData.crewMemberId,
          mission_id: mission.id,
          name: taskData.name,
          date: currentDate,
          start_hour: taskData.start,
          duration: taskData.duration,
          type: taskData.type,
          priority: taskData.priority,
          mission: taskData.mission,
          description: taskData.description,
          equipment: taskData.equipment,
        });
        return newActivity;
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteActivity(taskId);
      setIsFormOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handlePdfUploaded = (updatedActivity: Activity) => {
    setActivities((prev) => prev.map((a) => (a.id === updatedActivity.id ? updatedActivity : a)));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const canNavigatePrevious = () => {
    const date = new Date(currentDate);
    const missionStart = new Date(mission.startDate);
    date.setDate(date.getDate() - 1);
    return date >= missionStart;
  };

  const canNavigateNext = () => {
    const date = new Date(currentDate);
    const missionEnd = new Date(mission.endDate);
    date.setDate(date.getDate() + 1);
    return date <= missionEnd;
  };

  if (crewMembers.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          No crew members assigned to this mission yet.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Add crew members to start planning activities.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousDay}
            disabled={!canNavigatePrevious()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatDate(currentDate)}
          </h3>

          <Button variant="outline" size="sm" onClick={handleNextDay} disabled={!canNavigateNext()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-space-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
                      Crew Member
                    </th>
                    {hours.map((hour) => (
                      <th
                        key={hour}
                        className="px-2 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700"
                        style={{ minWidth: '60px' }}
                      >
                        {hour.toString().padStart(2, '0')}:00
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {crewMembers.map((member) => {
                    const memberActivities = getActivitiesForCrewMember(member.id);

                    return (
                      <tr
                        key={member.id}
                        className="border-t border-slate-200 dark:border-slate-700"
                      >
                        <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {member.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {member.role}
                            </div>
                          </div>
                        </td>
                        {hours.map((hour) => {
                          const activityAtHour = memberActivities.find(
                            (activity) =>
                              activity.start <= hour && activity.start + activity.duration > hour
                          );

                          const isActivityStart = activityAtHour && activityAtHour.start === hour;

                          return (
                            <td
                              key={hour}
                              className="relative border-r border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                              style={{ height: '60px', minWidth: '60px' }}
                              onClick={() => {
                                if (activityAtHour) {
                                  handleViewTask(activityAtHour);
                                } else {
                                  handleAddTask(member.id, hour);
                                }
                              }}
                            >
                              {isActivityStart && activityAtHour && (
                                <div
                                  className={`absolute inset-0 ${getActivityColor(activityAtHour.type)} rounded px-2 py-1 text-xs font-medium text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity pointer-events-none`}
                                  style={{
                                    width: `calc(${activityAtHour.duration * 100}% - 2px)`,
                                  }}
                                  title={activityAtHour.name}
                                >
                                  <div className="truncate">{activityAtHour.name}</div>
                                </div>
                              )}

                              {!activityAtHour && (
                                <button
                                  className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddTask(member.id, hour);
                                  }}
                                >
                                  <Plus className="h-4 w-4 text-slate-400" />
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteTask}
        task={selectedTask}
        crewMemberId={selectedCrewMemberId}
        defaultStartTime={defaultStartTime}
        date={currentDate}
        key={selectedTask?.id || 'new'}
        onPdfUploaded={handlePdfUploaded}
      />

      <ActivityModal
        activity={viewingTask}
        onClose={() => setViewingTask(null)}
        onEdit={(task) => {
          setViewingTask(null);
          handleEditTask(task);
        }}
      />
    </>
  );
};

export default TimelineView;
