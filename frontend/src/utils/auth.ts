import type { User, UserRole as Role } from '../types/auth';

export const ROLE_PERMISSIONS = {
  astronaut: {
    label: 'Astronaut',
    description: 'Crew member with access to personal schedules and mission activities',
    permissions: ['view_schedule', 'view_mission', 'update_own_activities'],
  },
  operator: {
    label: 'Operator',
    description: 'Mission operator with full control over missions and schedules',
    permissions: [
      'view_schedule',
      'view_mission',
      'create_mission',
      'edit_mission',
      'manage_crew',
      'manage_activities',
    ],
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to view missions and schedules',
    permissions: ['view_schedule', 'view_mission'],
  },
  admin: {
    label: 'Administrator',
    description: 'Full system access including user management',
    permissions: ['all'],
  },
};

export const getRoleBadgeColor = (role: Role) => {
  const colors: Record<Role, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    operator: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    astronaut: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  };

  return colors[role];
};

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return ROLE_PERMISSIONS[user.role]?.permissions.includes(permission) || false;
};

const users: User[] = [];

export const authenticateUser = (username: string, password: string): User | null => {
  const user = users.find((u) => u.username === username && u.password === password && u.isActive);

  if (user) {
    user.lastLogin = new Date().toISOString();
    return user;
  }

  return null;
};

export const getAllUsers = (): User[] => {
  return users.map((u) => ({ ...u, password: '****' }));
};

export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  return users[index];
};

export const deleteUser = (id: string): boolean => {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;

  users.splice(index, 1);
  return true;
};
