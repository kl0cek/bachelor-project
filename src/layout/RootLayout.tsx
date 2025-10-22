import { Outlet } from 'react-router';
import { MainHeader } from '../components/MainHeader';

export const RootLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <MainHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
