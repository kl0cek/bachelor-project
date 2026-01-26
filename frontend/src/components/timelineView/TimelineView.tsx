import { useEffect, useCallback } from 'react';
import { TaskForm } from '../taskForm/TaskForm';
import { ActivityModal } from '../activityModal/ActivityModal';
import { activityService } from '../../services/activityService';
import { useTimelineState, useTimelineScroll, useToast } from '../../hooks/index';
import { ScrollableTimelineTable } from './index';
import type { Mission, Activity } from '../../types/types';

type UpdateScope = 'single' | 'all';
type DeleteScope = 'single' | 'all';

interface TimelineViewProps {
  mission: Mission;
  onTodayAvailable?: (goToToday: () => void, isAvailable: boolean) => void;
}

export const TimelineView = ({ mission, onTodayAvailable }: TimelineViewProps) => {
  const {
    currentDate,
    activities,
    loading,
    isFormOpen,
    selectedTask,
    selectedCrewMemberId,
    defaultStartTime,
    viewingTask,
    createActivity,
    updateActivity,
    deleteActivity,
    setCurrentDate,
    handleAddTask,
    handleEditTask,
    handleViewTask,
    closeForm,
    setIsFormOpen,
    setSelectedTask,
    closeViewModal,
    handlePdfUploaded,
    refreshActivities,
  } = useTimelineState(mission);

  const { allDates, scrollContainerRef, getDayNumber, scrollToToday } = useTimelineScroll(mission);

  const { showError, showSuccess } = useToast();

  const crewMembers = mission.crewMembers || [];

  const isRecurringInstance = (task: Activity | null): boolean => {
    if (!task) return false;
    return !!task.parentActivityId;
  };

  const today = new Date().toISOString().split('T')[0];
  const isTodayInMission = allDates.includes(today);

  const handleGoToToday = useCallback(() => {
    if (isTodayInMission) {
      setCurrentDate(today);
      scrollToToday();
    }
  }, [isTodayInMission, setCurrentDate, today, scrollToToday]);

  useEffect(() => {
    if (onTodayAvailable) {
      onTodayAvailable(handleGoToToday, isTodayInMission);
    }
  }, [handleGoToToday, isTodayInMission, onTodayAvailable]);

  const handleFormSubmit = async (
    taskData: Activity,
    updateScope?: UpdateScope
  ): Promise<Activity | void> => {
    if (!taskData.crewMemberId) {
      showError('Crew member ID is required');
      return;
    }

    try {
      if (selectedTask) {
        if (updateScope === 'all' && selectedTask.parentActivityId) {

          const recurringUpdateData = {
            name: taskData.name,
            start_hour: taskData.start,
            duration: taskData.duration,
            type: taskData.type,
            priority: taskData.priority,
            mission: taskData.mission,
            description: taskData.description,
            equipment: taskData.equipment,
          };

          const result = await activityService.updateRecurringActivities(
            selectedTask.parentActivityId,
            recurringUpdateData
          );

          showSuccess(`Updated ${result.updated} instances, skipped ${result.skipped}`);

          await refreshActivities();

          setIsFormOpen(false);
          setSelectedTask(null);
          return;
        }

        const singleUpdateData = {
          name: taskData.name,
          date: currentDate,
          start_hour: taskData.start,
          duration: taskData.duration,
          type: taskData.type,
          priority: taskData.priority,
          mission: taskData.mission,
          description: taskData.description,
          equipment: taskData.equipment,
        };

        const updated = await updateActivity(selectedTask.id!, singleUpdateData);
        setIsFormOpen(false);
        setSelectedTask(null);
        return updated;
      } else {
        const createData = {
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
          is_recurring: taskData.isRecurring,
          recurrence: taskData.isRecurring ? taskData.recurrence : undefined,
        };

        const created = await createActivity(createData);

        setIsFormOpen(false);
        setSelectedTask(null);
        return created;
      }
    } catch (error) {
      showError('An error occurred while saving the activity.');
      console.error(error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string, deleteScope?: DeleteScope) => {
    try {
      const taskToDelete = selectedTask || activities.find((a) => a.id === taskId);

      if (deleteScope === 'all' && taskToDelete?.parentActivityId) {
        const result = await activityService.deleteRecurringActivities(
          taskToDelete.parentActivityId
        );
        showSuccess(`Deleted ${result.deleted} recurring activities`);

        await refreshActivities();
      } else {
        showSuccess('Deleting single instance...');
        await deleteActivity(taskId);
      }

      closeForm();
    } catch (error) {
      showError('An error occurred while deleting the activity.');
      console.error(error);
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
        <ScrollableTimelineTable
          crewMembers={crewMembers}
          allDates={allDates}
          activities={activities}
          loading={loading}
          onAddTask={handleAddTask}
          onViewTask={handleViewTask}
          scrollContainerRef={scrollContainerRef}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          getDayNumber={getDayNumber}
        />
      </div>

      <TaskForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteTask}
        task={selectedTask}
        crewMemberId={selectedCrewMemberId}
        defaultStartTime={defaultStartTime}
        date={currentDate}
        key={selectedTask?.id || 'new'}
        onPdfUploaded={handlePdfUploaded}
        missionEndDate={mission.endDate}
        isRecurringInstance={isRecurringInstance(selectedTask)}
      />

      <ActivityModal
        activity={viewingTask}
        onClose={closeViewModal}
        onEdit={(task) => {
          closeViewModal();
          handleEditTask(task);
        }}
      />
    </>
  );
};

export default TimelineView;
