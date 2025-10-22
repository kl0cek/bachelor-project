import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { MissionScheduler } from './pages/MissionScheduler';
import { CreateMission } from './pages/CreateMission';
import { RootLayout } from './layout/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/*',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'create-mission',
        element: <CreateMission />,
      },
      {
        path: 'mission/:id/scheduler',
        element: <MissionScheduler />,
      },
    ],
  },
]);
