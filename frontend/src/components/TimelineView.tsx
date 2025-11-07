import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/index';
import { TaskForm } from './TaskForm';
import { ActivityModal } from './ActivityModal';
import { TimelineDayContent } from './TimelineDayContent';
import { useActivities } from '../hooks/useActivities';
import { useTimelineScroll } from '../hooks/useTimelineScroll';
import type { Mission, Activity } from '../types/types';

interface TimelineViewProps {
  mission: Mission;
}

const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Activity | null>(null);
  const [selectedCrewMemberId, setSelectedCrewMemberId] = useState<string>('');
  const [defaultStartTime, setDefaultStartTime] = useState<number>(6);
  const [viewingTask, setViewingTask] = useState<Activity | null>(null);
  const [rowHeights, setRowHeights] = useState<number[]>([]);

  const crewMembers = mission.crewMembers || [];

  const {
    scrollContainerRef,
    canNavigatePrevious,
    canNavigateNext,
    handlePreviousDay,
    handleNextDay,
  } = useTimelineScroll({
    currentDate,
    missionStartDate: mission.startDate,
    missionEndDate: mission.endDate,
    onDateChange: setCurrentDate,
  });

  const dates: string[] = [];
  const prevDate = addDays(currentDate, -1);
  const nextDate = addDays(currentDate, 1);

  if (canNavigatePrevious) dates.push(prevDate);
  dates.push(currentDate);
  if (canNavigateNext) dates.push(nextDate);

const prevDayActivities = useActivities(
  mission.id, 
  canNavigatePrevious ? prevDate : undefined
);
const currentDayActivities = useActivities(mission.id, currentDate);
const nextDayActivities = useActivities(
  mission.id, 
  canNavigateNext ? nextDate : undefined
);

const activitiesMap: Record<string, Activity[]> = {
  [currentDate]: currentDayActivities.activities,
};

const loadingMap: Record<string, boolean> = {
  [currentDate]: currentDayActivities.loading,
};

if (canNavigatePrevious) {
  activitiesMap[prevDate] = prevDayActivities.activities;
  loadingMap[prevDate] = prevDayActivities.loading;
}

if (canNavigateNext) {
  activitiesMap[nextDate] = nextDayActivities.activities;
  loadingMap[nextDate] = nextDayActivities.loading;
}

  const handleMeasureRow = useCallback((index: number, height: number) => {
    setRowHeights((prev) => {
      const newHeights = [...prev];
      newHeights[index] = Math.max(newHeights[index] || 60, height);
      return newHeights;
    });
  }, []);

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

  const handleFormSubmit = async (taskData: Activity) => {
    if (!taskData.crewMemberId) {
      console.error('Crew member ID is required');
      return;
    }

    try {
      if (selectedTask) {
        await currentDayActivities.updateActivity(selectedTask.id!, {
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
      } else {
        await currentDayActivities.createActivity({
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
      }
      setIsFormOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await currentDayActivities.deleteActivity(taskId);
      setIsFormOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
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
            disabled={!canNavigatePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatDate(currentDate)}
          </h3>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextDay} 
            disabled={!canNavigateNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 z-20 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700" style={{ width: '200px' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="left-0 z-10 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
                    Crew Member
                  </th>
                </tr>
              </thead>
              <tbody>
                {crewMembers.map((member, index) => {
                  const appliedHeight = rowHeights[index] || 60;
                  return (
                    <tr
                      key={member.id}
                      className="border-t border-slate-200 dark:border-slate-700"
                      style={{ height: `${appliedHeight}px` }}
                    >
                      <td className="px-2 py-1 bg-white dark:bg-slate-800">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {member.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {member.role}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="overflow-hidden" style={{ paddingLeft: '200px' }}>
            <div
              ref={scrollContainerRef}
              className="overflow-x-scroll snap-x snap-mandatory scroll-smooth timeline-scroll-container"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div className="flex">
                <AnimatePresence mode="sync" initial={false}>
                  {dates.map((date) => (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TimelineDayContent
                        date={date}
                        mission={mission}
                        activities={activitiesMap[date] || []}
                        loading={loadingMap[date] || false}
                        onAddTask={handleAddTask}
                        onViewTask={handleViewTask}
                        rowHeights={rowHeights}
                        onMeasureRow={date === dates[1] ? handleMeasureRow : undefined}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
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
      />

      <ActivityModal
        activity={viewingTask}
        onClose={() => setViewingTask(null)}
        onEdit={(task) => {
          setViewingTask(null);
          handleEditTask(task);
        }}
      />

      <style>{`
        .timeline-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .timeline-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default TimelineView;
