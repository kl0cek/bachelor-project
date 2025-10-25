import { createBrowserRouter } from 'react-router';
import {
  HomePage,
  MissionScheduler,
  CreateMission,
  CrewSelection,
  UserManagement,
} from './pages/index';
import { RootLayout } from './layout/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

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
        element: (
          <ProtectedRoute requiredPermission="create_mission">
            <CreateMission />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mission/:id/crew',
        element: (
          <ProtectedRoute requiredPermission="manage_crew">
            <CrewSelection />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mission/:id/scheduler',
        element: (
          <ProtectedRoute requiredPermission="view_schedule">
            <MissionScheduler />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
