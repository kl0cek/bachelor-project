import { useState, useCallback, useMemo } from 'react';
import { TaskContext } from './TaskContext';
import { activityService } from '../services/activityService';
import type { Activity, CrewMember, TaskState } from '../types/types';

interface TaskProviderProps {
  children: React.ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [state, setState] = useState<TaskState>({
    crewMembers: [],
    loading: false,
    error: null,
  });

  const loadCrewMemberActivities = useCallback(async (crewMemberId: string, date?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const dateStr = date || new Date().toISOString().split('T')[0];
      const activities = await activityService.getActivitiesForCrewMember(crewMemberId, dateStr);

      setState((prev) => {
        const existingCrewIndex = prev.crewMembers.findIndex((c) => c.id === crewMemberId);
        let updatedCrewMembers: CrewMember[];

        if (existingCrewIndex >= 0) {
          updatedCrewMembers = [...prev.crewMembers];
          updatedCrewMembers[existingCrewIndex] = {
            ...updatedCrewMembers[existingCrewIndex],
            activities,
          };
        } else {
          const newCrew: CrewMember = {
            id: crewMemberId,
            name: '',
            activities,
          };
          updatedCrewMembers = [...prev.crewMembers, newCrew];
        }

        return {
          ...prev,
          crewMembers: updatedCrewMembers,
          loading: false,
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activities';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, []);

  const loadMissionActivities = useCallback(async (missionId: string, date?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const dateStr = date || new Date().toISOString().split('T')[0];
      const activities = await activityService.getActivitiesForMission(missionId, dateStr);

      const crewActivitiesMap = new Map<string, Activity[]>();
      activities.forEach((activity) => {
        if (activity.crewMemberId) {
          const existing = crewActivitiesMap.get(activity.crewMemberId) || [];
          crewActivitiesMap.set(activity.crewMemberId, [...existing, activity]);
        }
      });

      setState((prev) => {
        const updatedCrewMembers = prev.crewMembers.map((crew) => {
          const crewActivities = crewActivitiesMap.get(crew.id) || [];
          return { ...crew, activities: crewActivities };
        });

        crewActivitiesMap.forEach((activities, crewMemberId) => {
          if (!updatedCrewMembers.find((c) => c.id === crewMemberId)) {
            updatedCrewMembers.push({
              id: crewMemberId,
              name: '',
              activities,
            });
          }
        });

        return {
          ...prev,
          crewMembers: updatedCrewMembers,
          loading: false,
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load mission activities';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, []);

  const addTask = useCallback(async (crewMemberId: string, task: Activity) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (!task.missionId || !task.date) {
        throw new Error('Mission ID and date are required');
      }

      const newActivity = await activityService.createActivity({
        crew_member_id: crewMemberId,
        mission_id: task.missionId,
        name: task.name,
        date: task.date,
        start_hour: task.start,
        duration: task.duration,
        type: task.type,
        priority: task.priority,
        mission: task.mission,
        description: task.description,
        equipment: task.equipment,
      });

      setState((prev) => {
        const crewIndex = prev.crewMembers.findIndex((c) => c.id === crewMemberId);
        if (crewIndex >= 0) {
          const updatedCrewMembers = [...prev.crewMembers];
          updatedCrewMembers[crewIndex] = {
            ...updatedCrewMembers[crewIndex],
            activities: [...updatedCrewMembers[crewIndex].activities, newActivity],
          };
          return { ...prev, crewMembers: updatedCrewMembers, loading: false };
        }
        return { ...prev, loading: false };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (crewMemberId: string, task: Activity) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const updatedActivity = await activityService.updateActivity(task.id, {
        name: task.name,
        start_hour: task.start,
        duration: task.duration,
        type: task.type,
        priority: task.priority,
        mission: task.mission,
        description: task.description,
        equipment: task.equipment,
        date: task.date,
        crew_member_id: crewMemberId,
        mission_id: task.missionId!,
      });

      setState((prev) => {
        const crewIndex = prev.crewMembers.findIndex((c) => c.id === crewMemberId);
        if (crewIndex >= 0) {
          const updatedCrewMembers = [...prev.crewMembers];
          const activityIndex = updatedCrewMembers[crewIndex].activities.findIndex(
            (a) => a.id === task.id
          );
          if (activityIndex >= 0) {
            updatedCrewMembers[crewIndex].activities[activityIndex] = updatedActivity;
          }
          return { ...prev, crewMembers: updatedCrewMembers, loading: false };
        }
        return { ...prev, loading: false };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (crewMemberId: string, taskId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await activityService.deleteActivity(taskId);

      setState((prev) => {
        const crewIndex = prev.crewMembers.findIndex((c) => c.id === crewMemberId);
        if (crewIndex >= 0) {
          const updatedCrewMembers = [...prev.crewMembers];
          updatedCrewMembers[crewIndex] = {
            ...updatedCrewMembers[crewIndex],
            activities: updatedCrewMembers[crewIndex].activities.filter((a) => a.id !== taskId),
          };
          return { ...prev, crewMembers: updatedCrewMembers, loading: false };
        }
        return { ...prev, loading: false };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw err;
    }
  }, []);

  const getTaskById = useCallback(
    (taskId: string): { task: Activity; crewMemberId: string } | null => {
      for (const crewMember of state.crewMembers) {
        const task = crewMember.activities.find((a) => a.id === taskId);
        if (task) {
          return { task, crewMemberId: crewMember.id };
        }
      }
      return null;
    },
    [state.crewMembers]
  );

  const value = useMemo(
    () => ({
      state,
      addTask,
      updateTask,
      deleteTask,
      getTaskById,
      loadCrewMemberActivities,
      loadMissionActivities,
    }),
    [
      state,
      addTask,
      updateTask,
      deleteTask,
      getTaskById,
      loadCrewMemberActivities,
      loadMissionActivities,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
