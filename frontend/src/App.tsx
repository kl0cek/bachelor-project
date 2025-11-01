import { RouterProvider } from 'react-router';
import { router } from './Router';
// add authProvider beetwen things in app :))
export default function App() {
  return <RouterProvider router={router} />;
}
