import dayjs from 'dayjs';
import type { Task } from '../types/types';

const base = dayjs().startOf('day').add(9, 'hour');
export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'SLEEP-ISS',
    start: base.subtract(6, 'hour').toISOString(),
    end: base.subtract(4, 'hour').toISOString(),
    astronautId: 'a1',
    details: 'Sleep period',
  },
  {
    id: 't2',
    title: 'POSTSLEEP',
    start: base.toISOString(),
    end: base.add(1, 'hour').toISOString(),
    astronautId: 'a1',
    details: 'Post-sleep activities',
  },
  {
    id: 't3',
    title: 'EXERCISE',
    start: base.add(2, 'hour').toISOString(),
    end: base.add(3, 'hour').toISOString(),
    astronautId: 'a2',
    details: 'Treadmill session',
  },
  {
    id: 't4',
    title: 'ASIM-GND-CMD',
    start: base.add(1, 'hour').toISOString(),
    end: base.add(5, 'hour').toISOString(),
    astronautId: 'a3',
    details: 'Command window',
  },
];
