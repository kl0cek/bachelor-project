import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useStore } from '../hooks/useStore';
import TaskCard from './TaskCard';
import type { Astronaut } from '../types/types';

const TIMELINE_WIDTH = 1200; // px for the visible timeline container

export const Timeline = () => {
  const astronauts = useStore((s) => s.astronauts);
  const tasks = useStore((s) => s.tasks);
  const nowIso = useStore((s) => s.nowIso);
  const [selected, setSelected] = useState<string | null>(null);

  const dayStart = dayjs().startOf('day');
  const scale = useMemo(() => {
    // show 24h in TIMELINE_WIDTH
    return (iso: string) => {
      const t = dayjs(iso);
      const ratio = t.diff(dayStart, 'minute') / (24 * 60);
      return ratio * TIMELINE_WIDTH;
    };
  }, []);

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="mb-3">
        Current (mock) time: <strong>{dayjs(nowIso).format('YYYY-MM-DD HH:mm:ss')}</strong>
      </div>
      <div className="w-[1200px] border rounded bg-gray-50 p-3">
        {/* Day/night / orbit strip (simplified) */}
        <div className="h-8 mb-3 relative bg-gradient-to-r from-yellow-100 to-blue-200 rounded">
          <div className="absolute left-0 top-0 text-xs p-1">Day/Night (visual)</div>
        </div>

        {/* Time ruler */}
        <div className="flex items-center text-xs text-gray-600 mb-3">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} style={{ width: TIMELINE_WIDTH / 24 }} className="text-center">
              {i}
            </div>
          ))}
        </div>

        {/* Rows for astronauts */}
        <div className="space-y-3">
          {astronauts.map((a: Astronaut) => (
            <div key={a.id} className="relative h-14 border rounded p-2 bg-white">
              <div className="absolute left-2 top-2 text-sm font-medium">{a.name}</div>
              <div className="absolute left-28 right-2 top-2 bottom-2">
                <div className="relative h-full">
                  {tasks
                    .filter((t) => t.astronautId === a.id)
                    .map((t) => {
                      const left = scale(t.start);
                      const right = scale(t.end);
                      const width = Math.max(40, right - left);
                      return (
                        <div
                          key={t.id}
                          style={{ left, width }}
                          className={`absolute top-1 h-10 rounded shadow-sm p-1 ${a.color ?? 'bg-gray-300'}`}
                          onClick={() => setSelected(t.id)}
                        >
                          <TaskCard task={t} />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Unassigned row */}
        <div className="mt-4 relative h-14 border rounded p-2 bg-white">
          <div className="absolute left-2 top-2 text-sm font-medium">Unassigned</div>
          <div className="absolute left-28 right-2 top-2 bottom-2">
            <div className="relative h-full">
              {tasks
                .filter((t) => !t.astronautId)
                .map((t) => {
                  const left = scale(t.start);
                  const right = scale(t.end);
                  const width = Math.max(40, right - left);
                  return (
                    <div
                      key={t.id}
                      style={{ left, width }}
                      className={`absolute top-1 h-10 rounded shadow-sm p-1 bg-yellow-200`}
                    >
                      <TaskCard task={t} />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Details panel */}
      {selected && (
        <div className="mt-4 p-3 border rounded bg-white w-[400px]">
          <h4 className="font-semibold">Task details</h4>
          <pre className="text-xs mt-2">
            {JSON.stringify(
              tasks.find((t) => t.id === selected),
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Timeline;
