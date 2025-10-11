import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import Timeline from './components/Timeline';
import { useStore } from './hooks/useStore';
import { mockTasks } from './mock/data';
import { useMockSocket } from './mock/socket';

const App = () => {
  const tasksInStore = useStore((s) => s.tasks);

  useEffect(() => {
    // initialize tasks if not present
    if (tasksInStore.length === 0) {
      // direct set to avoid creating setters in store for demo simplicity
      useStore.setState({ tasks: mockTasks });
    }
  }, []);

  useMockSocket();

  return (
    <div className="h-screen flex bg-gray-100 text-gray-900">
      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center px-4 border-b bg-white">
          <div className="font-bold">ISS Timeline Prototype</div>
        </header>
        <main className="flex-1 flex overflow-hidden">
          <Timeline />
          <Sidebar />
        </main>
      </div>
    </div>
  );
};

export default App;