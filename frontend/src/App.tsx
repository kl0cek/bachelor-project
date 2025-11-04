import { RouterProvider } from 'react-router';
import { router } from './Router';
import { ErrorBoundary } from './components/ErrorBoundry';
// add authProvider beetwen things in app :))
export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
