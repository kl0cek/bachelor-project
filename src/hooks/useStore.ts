import { create } from 'zustand';
import type { Astronaut, Task } from '../types/types';

type State = {
  astronauts: Astronaut[];
  tasks: Task[];
  nowIso: string;
  assignTask: (taskId: string, astronautId: string | null) => void;
  moveTask: (taskId: string, startIso: string, endIso: string) => void;
  setNow: (iso: string) => void;
};

export const useStore = create<State>((set) => ({
  astronauts: [
    { id: 'a1', name: 'Drew', color: 'bg-sky-400' },
    { id: 'a2', name: 'Maker', color: 'bg-rose-400' },
    { id: 'a3', name: 'Col', color: 'bg-emerald-400' },
  ],
  tasks: [],
  nowIso: new Date().toISOString(),
  assignTask: (taskId, astronautId) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, astronautId } : t)) })),
  moveTask: (taskId, startIso, endIso) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, start: startIso, end: endIso } : t)),
    })),
  setNow: (iso) => set({ nowIso: iso }),
}));
