import { TaskForm } from '../taskForm/TaskForm';
import { ActivityModal } from '../activityModal/ActivityModal';
import { activityService } from '../../services/activityService';
import { useTimelineState } from '../../hooks/useTimelineState';
import { useTimelineScroll } from '../../hooks/useTimelineScroll';
import { ScrollableTimelineTable } from './index';
import type { Mission, Activity } from '../../types/types';

type UpdateScope = 'single' | 'all';
type DeleteScope = 'single' | 'all';

interface TimelineViewProps {
  mission: Mission;
}

export const TimelineView = ({ mission }: TimelineViewProps) => {
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

  const { allDates, scrollContainerRef, getDayNumber } = useTimelineScroll(mission);

  const crewMembers = mission.crewMembers || [];

  const isRecurringInstance = (task: Activity | null): boolean => {
    if (!task) return false;
    return !!task.parentActivityId;
  };

  const handleFormSubmit = async (
    taskData: Activity,
    updateScope?: UpdateScope
  ): Promise<Activity | void> => {
    if (!taskData.crewMemberId) {
      console.error('Crew member ID is required');
      return;
    }

    try {
      if (selectedTask) {
        if (updateScope === 'all' && selectedTask.parentActivityId) {
          console.log('Updating all instances in series...');

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

          console.log(`Updated ${result.updated} instances, skipped ${result.skipped}`);

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

        console.log('Updating single instance...');

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
      console.error('Error saving activity:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string, deleteScope?: DeleteScope) => {
    try {
      const taskToDelete = selectedTask || activities.find((a) => a.id === taskId);

      if (deleteScope === 'all' && taskToDelete?.parentActivityId) {
        console.log('Deleting entire series...');
        const result = await activityService.deleteRecurringActivities(
          taskToDelete.parentActivityId
        );
        console.log(`Deleted ${result.deleted} recurring activities`);

        await refreshActivities();
      } else {
        console.log('Deleting single instance...');
        await deleteActivity(taskId);
      }

      closeForm();
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
