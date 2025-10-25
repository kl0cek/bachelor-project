import { createContext } from 'react';
import type { TaskContextType } from '../types/types';

export const TaskContext = createContext<TaskContextType | undefined>(undefined);
