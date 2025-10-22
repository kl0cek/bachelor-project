import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, Button } from './ui/index';
import { cn, calculateActivityPosition } from '../utils/utils';
import { ActivityModal, TaskForm, QuickActions } from './index';
import { useTaskContext } from '../context/TaskContext';
import type { Activity, ActivityType } from '../types/types';

const hours = Array.from({ length: 8 }, (_, i) => i + 6);

const activityColors: Record<ActivityType, string> = {
  exercise: 'bg-space-600 text-white shadow-space border-space-700',
  meal: 'bg-slate-400 text-white dark:bg-slate-600 border-slate-500',
  sleep: 'bg-slate-400 text-white dark:bg-slate-600 border-slate-500',
  work: 'bg-space-600 text-white shadow-space border-space-700',
  eva: 'bg-orange-500 text-white shadow-orange border-orange-600',
  optional:
    'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
};

export const TimelineView = () => {
  const { state, addTask, updateTask, deleteTask, getTaskById } = useTaskContext();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Activity | null>(null);
  const [selectedCrewMemberId, setSelectedCrewMemberId] = useState<string>('');
  const [newTaskStartTime, setNewTaskStartTime] = useState<number>(6);

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleEditClick = (activity: Activity) => {
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
    const taskData = getTaskById(taskId);
    if (taskData) {
      deleteTask(taskData.crewMemberId, taskId);
    }
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleTimeSlotClick = (crewMemberId: string, hour: number) => {
    const member = state.crewMembers.find((m) => m.id === crewMemberId);
    if (!member) return;

    const conflictingActivity = member.activities.find((activity) => {
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
        <div className="overflow-x-auto">
          <div className="min-w-[900px] lg:min-w-0">
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
                    className="flex-1 border-l border-slate-200 dark:border-slate-800 px-4 py-6 text-center"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {hour.toString().padStart(2, '0')}:00
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">GMT</p>
                  </div>
                ))}
              </div>
            </div>

            {state.crewMembers.map((member, idx) => (
              <div
                key={member.id}
                className={cn(
                  'flex border-b border-slate-200 dark:border-slate-800 transition-colors',
                  idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-25 dark:bg-slate-900/20'
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
                      title={`Add task at ${hour}:00`}
                    >
                      <div className="opacity-0 group-hover/timeslot:opacity-100 transition-opacity flex items-center justify-center h-full">
                        <Plus className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                  {member.activities.map((activity) => {
                    const { left, width } = calculateActivityPosition(
                      activity.start,
                      activity.duration
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
            ))}
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
