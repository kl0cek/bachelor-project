import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';
import type { TaskContextType } from '../types/types';

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
