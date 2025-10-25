import { createContext, useReducer } from 'react';
import type { TaskState, Activity, TaskContextType } from '../types/types';
import { crewMembers as initialCrewMembers } from '../mock/data';

type TaskAction =
  | { type: 'ADD_TASK'; payload: { crewMemberId: string; task: Activity } }
  | { type: 'UPDATE_TASK'; payload: { crewMemberId: string; task: Activity } }
  | { type: 'DELETE_TASK'; payload: { crewMemberId: string; taskId: string } };

interface TaskProviderProps {
  children: React.ReactNode;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

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

    default:
      return state;
  }
};

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [state, dispatch] = useReducer(taskReducer, {
    crewMembers: initialCrewMembers,
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

  return (
    <TaskContext.Provider
      value={{
        state,
        addTask,
        updateTask,
        deleteTask,
        getTaskById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
