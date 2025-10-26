import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/types';

interface AuthGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

export const AuthGuard = ({
  children,
  requiredPermission,
  requiredRole,
  fallback,
}: AuthGuardProps) => {
  const { user, loading, hasPermission, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-space-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      fallback || (
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Authentication Required
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Please login to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      fallback || (
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Access Denied
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You don't have the required role to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      fallback || (
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Access Denied
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You don't have the required permission to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};
