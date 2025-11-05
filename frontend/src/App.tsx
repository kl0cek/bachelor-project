import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './Router';
import { authService } from './services/authService';
import { ErrorBoundary } from './components/ErrorBoundry';
// add authProvider beetwen things in app :))
export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await authService.initialize();
      setIsInitialized(true);
    };
    initAuth();
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
