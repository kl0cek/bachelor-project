import { useReducer, useCallback } from 'react';
import { TaskContext } from './TaskContext';
import type { TaskState, Activity } from '../types/types';
import { activityService } from '../services/activityService';

type TaskAction =
  | { type: 'SET_CREW_MEMBERS'; payload: any[] }
  | { type: 'ADD_TASK'; payload: { crewMemberId: string; task: Activity } }
  | { type: 'UPDATE_TASK'; payload: { crewMemberId: string; task: Activity } }
  | { type: 'DELETE_TASK'; payload: { crewMemberId: string; taskId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface TaskProviderProps {
  children: React.ReactNode;
}

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_CREW_MEMBERS':
      return {
        ...state,
        crewMembers: action.payload,
      };

    case 'ADD_TASK':
      return {
        ...state,
        crewMembers: state.crewMembers.map((member) =>
          member.id === action.payload.crewMemberId
            ? {
                ...member,
                activities: [...member.activities, action.payload.task].sort(
                  (a, b) => a.start - b.start
                ),
              }
            : member
        ),
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        crewMembers: state.crewMembers.map((member) =>
          member.id === action.payload.crewMemberId
            ? {
                ...member,
                activities: member.activities
                  .map((activity) =>
                    activity.id === action.payload.task.id ? action.payload.task : activity
                  )
                  .sort((a, b) => a.start - b.start),
              }
            : member
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        crewMembers: state.crewMembers.map((member) =>
          member.id === action.payload.crewMemberId
            ? {
                ...member,
                activities: member.activities.filter(
                  (activity) => activity.id !== action.payload.taskId
                ),
              }
            : member
        ),
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [state, dispatch] = useReducer(taskReducer, {
    crewMembers: [],
    loading: false,
    error: null,
  });

  const addTask = useCallback((crewMemberId: string, task: Activity) => {
    dispatch({ type: 'ADD_TASK', payload: { crewMemberId, task } });
  }, []);

  const updateTask = useCallback((crewMemberId: string, task: Activity) => {
    dispatch({ type: 'UPDATE_TASK', payload: { crewMemberId, task } });
  }, []);

  const deleteTask = useCallback((crewMemberId: string, taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: { crewMemberId, taskId } });
  }, []);

  const getTaskById = useCallback((taskId: string): { task: Activity; crewMemberId: string } | null => {
    for (const member of state.crewMembers) {
      const task = member.activities.find((activity) => activity.id === taskId);
      if (task) {
        return { task, crewMemberId: member.id };
      }
    }
    return null;
  }, [state.crewMembers]);

  const loadCrewMemberActivities = useCallback(async (crewMemberId: string, date?: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const activities = await activityService.getActivitiesForCrewMember(
        crewMemberId,
        date || new Date().toISOString().split('T')[0]
      );

      dispatch({
        type: 'SET_CREW_MEMBERS',
        payload: state.crewMembers.map((member) =>
          member.id === crewMemberId
            ? { ...member, activities: activities.sort((a, b) => a.start - b.start) }
            : member
        ),
      });

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load activities',
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.crewMembers]);

  const loadMissionActivities = useCallback(async (missionId: string, date?: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const activities = await activityService.getActivitiesForMission(
        missionId,
        date || new Date().toISOString().split('T')[0]
      );

      const activitiesByCrewMember = activities.reduce((acc, activity) => {
        const crewMemberId = activity.crewMemberId || 'unassigned';
        if (!acc[crewMemberId]) {
          acc[crewMemberId] = [];
        }
        acc[crewMemberId].push(activity);
        return acc;
      }, {} as Record<string, Activity[]>);

      dispatch({
        type: 'SET_CREW_MEMBERS',
        payload: state.crewMembers.map((member) => ({
          ...member,
          activities: (activitiesByCrewMember[member.id] || []).sort(
            (a, b) => a.start - b.start
          ),
        })),
      });

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load activities',
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.crewMembers]);

  return (
    <TaskContext.Provider
      value={{
        state,
        addTask,
        updateTask,
        deleteTask,
        getTaskById,
        loadCrewMemberActivities,
        loadMissionActivities,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
