import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card, Button } from './ui/index';
import { cn, calculateActivityPosition } from '../utils/utils';
import { ActivityModal, TaskForm, QuickActions, DayHeader } from './index';
import { useTaskContext } from '../hooks/useTaskContext';
import type { Activity, ActivityType, Mission } from '../types/types';
import { getMockActivitiesForDay } from '../mock/weekdata';

const hours = Array.from({ length: 24 }, (_, i) => i);

const activityColors: Record<ActivityType, string> = {
  exercise: 'bg-space-600 text-white shadow-space border-space-700',
  meal: 'bg-slate-400 text-white dark:bg-slate-600 border-slate-500',
  sleep: 'bg-slate-400 text-white dark:bg-slate-600 border-slate-500',
  work: 'bg-space-600 text-white shadow-space border-space-700',
  eva: 'bg-orange-500 text-white shadow-orange border-orange-600',
  optional:
    'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
};

const calculateMissionDay = (currentDate: Date, missionStartDate: Date): number => {
  const diffTime = currentDate.getTime() - missionStartDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

interface TimelineViewProps {
  mission?: Mission;
}

export const TimelineView = ({ mission }: TimelineViewProps) => {
  const { state, addTask, updateTask, deleteTask, getTaskById } = useTaskContext();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Activity | null>(null);
  const [selectedCrewMemberId, setSelectedCrewMemberId] = useState<string>('');
  const [newTaskStartTime, setNewTaskStartTime] = useState<number>(6);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [missionDay, setMissionDay] = useState<number>(1);
  const [mockDailyActivities, setMockDailyActivities] = useState<Record<string, Activity[]>>({});
  const [hiddenMockActivities, setHiddenMockActivities] = useState<Set<string>>(new Set());

  const missionStartDate = mission ? new Date(mission.startDate) : new Date();
  const missionEndDate = mission
    ? new Date(mission.endDate)
    : new Date(new Date().setMonth(new Date().getMonth() + 6));

  // Initialize and load activities for current day
  useEffect(() => {
    if (mission) {
      const today = new Date();
      const start = new Date(mission.startDate);
      const end = new Date(mission.endDate);

      if (today >= start && today <= end) {
        setCurrentDate(today);
        const day = calculateMissionDay(today, start);
        setMissionDay(day);
        setMockDailyActivities(getMockActivitiesForDay(day));
      } else if (today < start) {
        setCurrentDate(start);
        setMissionDay(1);
        setMockDailyActivities(getMockActivitiesForDay(1));
      } else {
        setCurrentDate(end);
        const day = calculateMissionDay(end, start);
        setMissionDay(day);
        setMockDailyActivities(getMockActivitiesForDay(day));
      }
    }
  }, [mission]);

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);

    if (newDate >= missionStartDate) {
      const newDay = calculateMissionDay(newDate, missionStartDate);
      setCurrentDate(newDate);
      setMissionDay(newDay);
      const newMockData = getMockActivitiesForDay(newDay);
      setMockDailyActivities(newMockData);
      console.log(`Switched to Day ${newDay}`, newMockData);
    }
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);

    if (newDate <= missionEndDate) {
      const newDay = calculateMissionDay(newDate, missionStartDate);
      setCurrentDate(newDate);
      setMissionDay(newDay);
      const newMockData = getMockActivitiesForDay(newDay);
      setMockDailyActivities(newMockData);
      console.log(`Switched to Day ${newDay}`, newMockData);
    }
  };

  const handleDateSelect = () => {
    console.log('Open date picker modal');
  };

  const canGoPrevious = currentDate > missionStartDate;
  const canGoNext = currentDate < missionEndDate;

  // Merge mock activities with user-added activities from context
  const getCrewMemberActivities = (crewMemberId: string): Activity[] => {
    const mockActivities = mockDailyActivities[crewMemberId] || [];
    const contextMember = state.crewMembers.find((m) => m.id === crewMemberId);
    const contextActivities = contextMember?.activities || [];

    const filteredMockActivities = mockActivities.filter(
      (activity) => !hiddenMockActivities.has(activity.id)
    );

    return [...filteredMockActivities, ...contextActivities].sort((a, b) => a.start - b.start);
  };

  const handleActivityClick = (activity: Activity) => {
    const mockActivities = Object.values(mockDailyActivities).flat();
    const isMockActivity = mockActivities.some((a) => a.id === activity.id);

    if (isMockActivity) {
      const firstCrewMemberId = Object.keys(mockDailyActivities).find((crewId) =>
        mockDailyActivities[crewId]?.some((a) => a.id === activity.id)
      );
      if (firstCrewMemberId) {
        setSelectedCrewMemberId(firstCrewMemberId);
      }
    }

    setSelectedActivity(activity);
  };

  const handleEditClick = (activity: Activity) => {
    const mockActivities = mockDailyActivities[selectedCrewMemberId] || [];
    const isMockActivity = mockActivities.some((a) => a.id === activity.id);

    if (isMockActivity) {
      setEditingTask(activity);
      setSelectedCrewMemberId(selectedCrewMemberId || Object.keys(mockDailyActivities)[0]);
      setIsTaskFormOpen(true);
      setSelectedActivity(null);
      return;
    }

    const taskData = getTaskById(activity.id);
    if (taskData) {
      setEditingTask(activity);
      setSelectedCrewMemberId(taskData.crewMemberId);
      setIsTaskFormOpen(true);
    }
    setSelectedActivity(null);
  };

  const handleCreateTask = (crewMemberId: string, startTime?: number) => {
    setSelectedCrewMemberId(crewMemberId);
    setNewTaskStartTime(startTime || 6);
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleTaskSubmit = (task: Activity) => {
    if (editingTask) {
      updateTask(selectedCrewMemberId, task);
    } else {
      addTask(selectedCrewMemberId, task);
    }
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleTaskDelete = (taskId: string) => {
    const mockActivities = Object.values(mockDailyActivities).flat();
    const isMockActivity = mockActivities.some((activity) => activity.id === taskId);

    if (isMockActivity) {
      setHiddenMockActivities((prev) => new Set([...prev, taskId]));
    } else {
      const taskData = getTaskById(taskId);
      if (taskData) {
        deleteTask(taskData.crewMemberId, taskId);
      }
    }

    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleTimeSlotClick = (crewMemberId: string, hour: number) => {
    const activities = getCrewMemberActivities(crewMemberId);
    const conflictingActivity = activities.find((activity) => {
      const activityEnd = activity.start + activity.duration;
      return hour >= activity.start && hour < activityEnd;
    });

    if (!conflictingActivity) {
      handleCreateTask(crewMemberId, hour);
    }
  };

  return (
    <>
      <Card className="overflow-hidden shadow-xl">
        <DayHeader
          currentDate={currentDate}
          missionDay={missionDay}
          mission={mission}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onDateSelect={handleDateSelect}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />

        <div className="overflow-x-auto">
          <div className="min-w-[1400px] lg:min-w-0">
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="w-32 md:w-40 shrink-0 px-6 py-6">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Crew Member
                </p>
              </div>
              <div className="flex flex-1">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="flex-1 border-l border-slate-200 dark:border-slate-800 px-2 py-6 text-center"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {hour.toString().padStart(2, '0')}:00
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">UTC</p>
                  </div>
                ))}
              </div>
            </div>

            {state.crewMembers.map((member, idx) => {
              const memberActivities = getCrewMemberActivities(member.id);

              return (
                <div
                  key={member.id}
                  className={cn(
                    'flex border-b border-slate-200 dark:border-slate-800 transition-colors',
                    idx % 2 === 0
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-slate-25 dark:bg-slate-900/20'
                  )}
                >
                  <div className="w-32 md:w-40 shrink-0 px-6 py-10 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Flight Engineer
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCreateTask(member.id)}
                      className="h-8 w-8 text-slate-500 hover:text-space-600 hover:bg-space-50 dark:hover:bg-space-950"
                      title="Add new task"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative flex flex-1 group">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="flex-1 border-l border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group/timeslot"
                        onClick={() => handleTimeSlotClick(member.id, hour)}
                        title={`Add task at ${hour.toString().padStart(2, '0')}:00`}
                      >
                        <div className="opacity-0 group-hover/timeslot:opacity-100 transition-opacity flex items-center justify-center h-full">
                          <Plus className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                    {memberActivities.map((activity) => {
                      const { left, width } = calculateActivityPosition(
                        activity.start,
                        activity.duration,
                        0,
                        24
                      );
                      return (
                        <button
                          key={activity.id}
                          onClick={() => handleActivityClick(activity)}
                          className={cn(
                            'absolute top-6 bottom-6 rounded-xl px-4 py-3 transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer border-2 group',
                            activityColors[activity.type]
                          )}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                          }}
                        >
                          <div className="text-left">
                            <p className="text-xs font-bold leading-tight truncate group-hover:text-clip">
                              {activity.name}
                            </p>
                            {activity.mission && (
                              <p className="text-xs opacity-80 leading-tight truncate mt-1">
                                {activity.mission}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <ActivityModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onEdit={handleEditClick}
      />

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        onDelete={handleTaskDelete}
        task={editingTask}
        crewMemberId={selectedCrewMemberId}
        defaultStartTime={newTaskStartTime}
      />

      <QuickActions onCreateTask={handleCreateTask} />
    </>
  );
};
