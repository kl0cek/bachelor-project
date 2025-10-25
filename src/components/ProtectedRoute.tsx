import { Navigate } from 'react-router';
import { useEffect, useState } from 'react';
import type { User } from '../types/auth';
import { ROLE_PERMISSIONS } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export const ProtectedRoute = ({
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-space-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Admin has access to everything
  if (user.role === 'admin') {
    return <>{children}</>;
  }

  // Check required role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Access Denied
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You don't have permission to access this page. Required role: {requiredRole}
          </p>
          <a href="/" className="text-space-600 hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Check required permission
  if (requiredPermission) {
    const userPermissions = ROLE_PERMISSIONS[user.role]?.permissions || [];
    const hasPermission = userPermissions.includes(requiredPermission);

    if (!hasPermission) {
      return (
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Access Denied
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You don't have the required permission to access this page.
            </p>
            <a href="/" className="text-space-600 hover:underline">
              Return to Home
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
