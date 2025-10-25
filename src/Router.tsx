import { createBrowserRouter } from 'react-router';
import { HomePage, MissionScheduler, CreateMission, CrewSelection } from './pages/index';
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
        path: 'mission/:id/crew',
        element: <CrewSelection />,
      },
      {
        path: 'mission/:id/scheduler',
        element: <MissionScheduler />,
      },
    ],
  },
]);
