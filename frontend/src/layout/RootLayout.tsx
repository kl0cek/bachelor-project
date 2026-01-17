import { Outlet } from 'react-router';
import { MainHeader } from '../components/header/MainHeader';
import { ToastProvider } from '../context/ToastProvider';

export const RootLayout = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
        <MainHeader />
        <main className="overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
};
