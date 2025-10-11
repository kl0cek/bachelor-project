import React, { useState, useEffect } from 'react';
import { create } from 'zustand';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { Users, Calendar, Settings, Plus } from 'lucide-react';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayOfYear);

// Types
type TaskType = 'SLEEP' | 'EXERCISE' | 'RESEARCH' | 'MAINTENANCE' | 'COMMS' | 'MEAL';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Task {
  id: string;
  title: string;
  type: TaskType;
  astronautId: string;
  startTime: string;
  endTime: string;
  priority: TaskPriority;
  description?: string;
  resources?: string[];
}

interface Astronaut {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface TimelineState {
  tasks: Task[];
  astronauts: Astronaut[];
  selectedTask: Task | null;
  currentTime: Date;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setSelectedTask: (task: Task | null) => void;
  updateCurrentTime: () => void;
}

// Zustand Store
const useTimelineStore = create<TimelineState>((set) => ({
  tasks: [
    {
      id: '1',
      title: 'Sleep Period',
      type: 'SLEEP',
      astronautId: 'ast-1',
      startTime: '2025-10-11T22:00:00Z',
      endTime: '2025-10-12T06:00:00Z',
      priority: 'HIGH',
      description: 'Mandatory rest period',
    },
    {
      id: '2',
      title: 'Morning Exercise',
      type: 'EXERCISE',
      astronautId: 'ast-1',
      startTime: '2025-10-12T07:00:00Z',
      endTime: '2025-10-12T08:30:00Z',
      priority: 'HIGH',
      description: 'Daily physical maintenance - ARED and T2',
    },
    {
      id: '3',
      title: 'EVA Preparation',
      type: 'MAINTENANCE',
      astronautId: 'ast-2',
      startTime: '2025-10-12T09:00:00Z',
      endTime: '2025-10-12T12:00:00Z',
      priority: 'CRITICAL',
      description: 'Spacesuit check and tool preparation',
      resources: ['EMU-1', 'Tool Kit A'],
    },
    {
      id: '4',
      title: 'Biology Experiment',
      type: 'RESEARCH',
      astronautId: 'ast-2',
      startTime: '2025-10-12T14:00:00Z',
      endTime: '2025-10-12T16:00:00Z',
      priority: 'MEDIUM',
      description: 'Plant growth analysis in microgravity',
    },
  ],
  astronauts: [
    { id: 'ast-1', name: 'Dr. Elena Rodriguez', role: 'Commander', avatar: 'ER' },
    { id: 'ast-2', name: 'Col. Marcus Chen', role: 'Flight Engineer', avatar: 'MC' },
    { id: 'ast-3', name: 'Dr. Sarah Williams', role: 'Science Officer', avatar: 'SW' },
  ],
  selectedTask: null,
  currentTime: new Date(),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  setSelectedTask: (task) => set({ selectedTask: task }),
  updateCurrentTime: () => set({ currentTime: new Date() }),
}));

// Mock orbit data
const getOrbitPhase = (time: Date): 'day' | 'night' => {
  const hour = time.getUTCHours();
  const minute = time.getUTCMinutes();
  const totalMinutes = hour * 60 + minute;
  const cycleMinutes = totalMinutes % 90;
  return cycleMinutes < 45 ? 'day' : 'night';
};

// Components
const Header = () => {
  const currentTime = useTimelineStore((state) => state.currentTime);
  const dayOfYearNum = dayjs(currentTime).dayOfYear();
  const orbitPhase = getOrbitPhase(currentTime);

  return (
    <header className="bg-slate-900 text-white px-6 py-4 border-b border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ISS OPTIMIS</h1>
            <p className="text-xs text-slate-400">Mission Planning System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-400">GMT Time</p>
            <p className="font-mono text-sm">{dayjs(currentTime).utc().format('HH:mm:ss')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Day of Year</p>
            <p className="font-mono text-sm font-bold">{dayOfYearNum}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Orbit Phase</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${orbitPhase === 'day' ? 'bg-yellow-400' : 'bg-slate-600'}`} />
              <p className="font-mono text-sm uppercase">{orbitPhase}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

const TimelineGrid = () => {
  const tasks = useTimelineStore((state) => state.tasks);
  const astronauts = useTimelineStore((state) => state.astronauts);
  const setSelectedTask = useTimelineStore((state) => state.setSelectedTask);
  const currentTime = useTimelineStore((state) => state.currentTime);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const startOfDay = dayjs(currentTime).startOf('day');

  const getTaskStyle = (task: Task) => {
    const start = dayjs(task.startTime);
    const end = dayjs(task.endTime);
    const dayStart = startOfDay;
    
    const startMinutes = start.diff(dayStart, 'minute');
    const duration = end.diff(start, 'minute');
    
    const left = (startMinutes / (24 * 60)) * 100;
    const width = (duration / (24 * 60)) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const getTaskColor = (type: TaskType) => {
    const colors = {
      SLEEP: 'bg-purple-500',
      EXERCISE: 'bg-green-500',
      RESEARCH: 'bg-blue-500',
      MAINTENANCE: 'bg-orange-500',
      COMMS: 'bg-cyan-500',
      MEAL: 'bg-yellow-500',
    };
    return colors[type];
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="min-w-[1200px]">
        {/* Time header */}
        <div className="sticky top-0 z-10 bg-slate-100 border-b border-slate-300">
          <div className="flex">
            <div className="w-48 border-r border-slate-300 bg-slate-200 p-3 font-semibold">
              Astronaut
            </div>
            <div className="flex-1 flex">
              {hours.map((hour) => (
                <div key={hour} className="flex-1 border-r border-slate-300 p-2 text-center text-xs font-mono">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Astronaut rows */}
        {astronauts.map((astronaut) => (
          <div key={astronaut.id} className="flex border-b border-slate-300 h-24">
            <div className="w-48 border-r border-slate-300 bg-white p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {astronaut.avatar}
              </div>
              <div>
                <p className="font-semibold text-sm">{astronaut.name}</p>
                <p className="text-xs text-slate-500">{astronaut.role}</p>
              </div>
            </div>
            <div className="flex-1 relative bg-white">
              {/* Hour grid lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute top-0 bottom-0 border-r border-slate-200"
                  style={{ left: `${(hour / 24) * 100}%` }}
                />
              ))}
              
              {/* Tasks */}
              {tasks
                .filter((task) => task.astronautId === astronaut.id)
                .map((task) => (
                  <div
                    key={task.id}
                    className={`absolute top-2 bottom-2 ${getTaskColor(task.type)} rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all border-2 border-white overflow-hidden`}
                    style={getTaskStyle(task)}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="h-full p-2 text-white">
                      <p className="text-xs font-bold truncate">{task.title}</p>
                      <p className="text-[10px] opacity-90">
                        {dayjs(task.startTime).format('HH:mm')} - {dayjs(task.endTime).format('HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TaskDetailsSidebar = () => {
  const selectedTask = useTimelineStore((state) => state.selectedTask);
  const setSelectedTask = useTimelineStore((state) => state.setSelectedTask);
  const deleteTask = useTimelineStore((state) => state.deleteTask);

  if (!selectedTask) {
    return (
      <aside className="w-80 bg-white border-l border-slate-300 p-6">
        <div className="text-center text-slate-400 mt-20">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select a task to view details</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white border-l border-slate-300 p-6 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Task Details</h2>
        <button
          onClick={() => setSelectedTask(null)}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide">Title</label>
          <p className="font-semibold mt-1">{selectedTask.title}</p>
        </div>

        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide">Type</label>
          <p className="mt-1">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {selectedTask.type}
            </span>
          </p>
        </div>

        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide">Priority</label>
          <p className="mt-1">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              selectedTask.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
              selectedTask.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
              selectedTask.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {selectedTask.priority}
            </span>
          </p>
        </div>

        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide">Time</label>
          <p className="mt-1 font-mono text-sm">
            {dayjs(selectedTask.startTime).format('HH:mm')} - {dayjs(selectedTask.endTime).format('HH:mm')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Duration: {dayjs(selectedTask.endTime).diff(dayjs(selectedTask.startTime), 'minute')} minutes
          </p>
        </div>

        {selectedTask.description && (
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide">Description</label>
            <p className="mt-1 text-sm text-slate-700">{selectedTask.description}</p>
          </div>
        )}

        {selectedTask.resources && selectedTask.resources.length > 0 && (
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide">Resources</label>
            <div className="mt-2 space-y-1">
              {selectedTask.resources.map((resource, idx) => (
                <div key={idx} className="text-sm bg-slate-100 px-3 py-1 rounded">
                  {resource}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 space-y-2">
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Edit Task
          </button>
          <button
            onClick={() => {
              deleteTask(selectedTask.id);
              setSelectedTask(null);
            }}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Task
          </button>
        </div>
      </div>
    </aside>
  );
};

const App = () => {
  const updateCurrentTime = useTimelineStore((state) => state.updateCurrentTime);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCurrentTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateCurrentTime]);

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <TimelineGrid />
        <TaskDetailsSidebar />
      </div>
    </div>
  );
};

export default App;