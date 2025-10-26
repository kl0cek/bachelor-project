import { useState, useEffect } from 'react';
import type { User } from '../types/auth';
import { ROLE_PERMISSIONS } from '../utils/auth';

export const useAuth = () => {
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

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const userPermissions = ROLE_PERMISSIONS[user.role]?.permissions || [];
    return userPermissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role || user.role === 'admin';
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
  };
};

export const usePermissions = () => {
  const { hasPermission, hasRole, user } = useAuth();

  return {
    hasPermission,
    hasRole,
    canCreateMission: hasPermission('create_mission'),
    canEditMission: hasPermission('edit_mission'),
    canManageCrew: hasPermission('manage_crew'),
    canViewSchedule: hasPermission('view_schedule'),
    canManageActivities: hasPermission('manage_activities'),
    isAdmin: hasRole('admin'),
    isOperator: hasRole('operator'),
    isAstronaut: hasRole('astronaut'),
    isViewer: hasRole('viewer'),
    userRole: user?.role,
  };
};
