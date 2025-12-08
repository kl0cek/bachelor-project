import { TaskForm } from '../taskForm/TaskForm';
import { ActivityModal } from '../activityModal/ActivityModal';
import { useTimelineState } from '../../hooks/useTimelineState';
import { useTimelineScroll } from '../../hooks/useTimelineScroll';
import { ScrollableTimelineTable } from './index';
import type { Mission, Activity } from '../../types/types';

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
  } = useTimelineState(mission);

  const {
    allDates,
    scrollContainerRef,
    getDayNumber,
  } = useTimelineScroll(mission);

  const crewMembers = mission.crewMembers || [];

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
        setIsFormOpen(false);
        setSelectedTask(null);
        return updated;
      } else {
        const created = await createActivity({
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
          recurrence: taskData.recurrence,
        });
        setIsFormOpen(false);
        setSelectedTask(null);
        return created;
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteActivity(taskId);
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
