import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { HomePage, LazyRoute } from './pages/index';
import { RootLayout } from './layout/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { VideoCallProvider } from './context/VideoCallContext';

const CreateMission = lazy(
  () => import(/* webpackChunkName: "create-mission" */ './pages/CreateMission')
);
const CrewSelection = lazy(
  () => import(/* webpackChunkName: "crew-selection" */ './pages/CrewSelection')
);
const MissionScheduler = lazy(
  () => import(/* webpackChunkName: "mission-scheduler" */ './pages/MissionScheduler')
);
const UserManagement = lazy(
  () => import(/* webpackChunkName: "user-management" */ './pages/UserManagement')
);
const EditMission = lazy(
  () => import(/* webpackChunkName: "edit-mission" */ './pages/EditMission')
);
const VideoRoom = lazy(() => import(/* webpackChunkName: "video-call" */ './components/VideoCall'));

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
          <LazyRoute>
            <ProtectedRoute requiredPermission="create_mission">
              <CreateMission />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: 'mission/:id/edit',
        element: (
          <LazyRoute>
            <ProtectedRoute requiredPermission="edit_mission">
              <EditMission />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: 'mission/:id/crew',
        element: (
          <LazyRoute>
            <ProtectedRoute requiredPermission="manage_crew">
              <CrewSelection />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: 'mission/:id/scheduler',
        element: (
          <LazyRoute>
            <ProtectedRoute requiredPermission="view_schedule">
              <MissionScheduler />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <LazyRoute>
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: 'mission/:missionId/video-call',
        element: (
          <LazyRoute>
            <VideoCallProvider>
              <VideoRoom />
            </VideoCallProvider>
          </LazyRoute>
        ),
      },
    ],
  },
]);
