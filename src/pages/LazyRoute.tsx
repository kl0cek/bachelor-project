import { Suspense } from 'react';
import { PageLoader } from './index';

export const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export default LazyRoute;
