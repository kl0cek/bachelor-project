import { useState, useCallback } from 'react';
import { useAllMissionActivities } from './useAllMissionActivities';
import type { Mission, Activity } from '../types/types';

export const useTimelineState = (mission: Mission) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    const missionStart = new Date(mission.startDate);
    const missionEnd = new Date(mission.endDate);
    if (today >= missionStart && today <= missionEnd) {
      return today.toISOString().split('T')[0];
    }
    return missionStart.toISOString().split('T')[0];
  });

  const {
    activities,
    setActivities,
    loading,
    createActivity,
    updateActivity,
    deleteActivity,
    refetch,
  } = useAllMissionActivities(mission.id, mission.startDate, mission.endDate);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Activity | null>(null);
  const [selectedCrewMemberId, setSelectedCrewMemberId] = useState<string>('');
  const [defaultStartTime, setDefaultStartTime] = useState<number>(6);
  const [viewingTask, setViewingTask] = useState<Activity | null>(null);

  const refreshActivities = useCallback(async () => {
    await refetch();
  }, [refetch]);

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

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  const closeViewModal = () => {
    setViewingTask(null);
  };

  const handlePdfUploaded = (updatedActivity: Activity) => {
    setActivities((prev) => prev.map((a) => (a.id === updatedActivity.id ? updatedActivity : a)));
  };

  return {
    currentDate,
    setCurrentDate,
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
    handlePreviousDay,
    handleNextDay,
    canNavigatePrevious,
    canNavigateNext,
    handleAddTask,
    handleEditTask,
    handleViewTask,
    closeForm,
    setIsFormOpen,
    setSelectedTask,
    closeViewModal,
    handlePdfUploaded,
    refreshActivities,
  };
};
