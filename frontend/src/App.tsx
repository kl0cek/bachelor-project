import { RouterProvider } from 'react-router';
import { router } from './Router';
import { ErrorBoundary } from './components/ErrorBoundry';
import { AuthProvider } from './context/AuthProvider';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
