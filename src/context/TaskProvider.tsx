import { useReducer } from 'react';
import { TaskContext } from './TaskContext';
import type { TaskState, Activity } from '../types/types';
import { crewMembers as initialCrewMembers } from '../mock/data';

type TaskAction =
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
    crewMembers: initialCrewMembers,
    loading: false,
    error: null,
  });

  const addTask = (crewMemberId: string, task: Activity) => {
    dispatch({ type: 'ADD_TASK', payload: { crewMemberId, task } });
  };

  const updateTask = (crewMemberId: string, task: Activity) => {
    dispatch({ type: 'UPDATE_TASK', payload: { crewMemberId, task } });
  };

  const deleteTask = (crewMemberId: string, taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: { crewMemberId, taskId } });
  };

  const getTaskById = (taskId: string): { task: Activity; crewMemberId: string } | null => {
    for (const member of state.crewMembers) {
      const task = member.activities.find((activity) => activity.id === taskId);
      if (task) {
        return { task, crewMemberId: member.id };
      }
    }
    return null;
  };

  const loadCrewMemberActivities = async (crewMemberId: string, date?: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // TODO: Implement API call to load crew member activities
      // For now, this is a placeholder
      console.log(`Loading activities for crew member ${crewMemberId} on ${date || 'today'}`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load activities',
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadMissionActivities = async (missionId: string, date?: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // TODO: Implement API call to load mission activities
      // For now, this is a placeholder
      console.log(`Loading activities for mission ${missionId} on ${date || 'today'}`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load activities',
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

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
