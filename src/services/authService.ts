import type { User, UserRole } from '../types/auth';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

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

class AuthService {
  private currentUser: User | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      localStorage.removeItem('currentUser');
    }

    this.isInitialized = true;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const mockUsers: User[] = [
      {
        id: 'user-1',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        fullName: 'System Administrator',
        email: 'admin@mission-control.space',
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'user-2',
        username: 'operator1',
        password: 'operator123',
        role: 'operator',
        fullName: 'Mission Operator',
        email: 'operator@mission-control.space',
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'user-3',
        username: 'astronaut1',
        password: 'astronaut123',
        role: 'astronaut',
        fullName: 'John Astronaut',
        email: 'astronaut@mission-control.space',
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'user-4',
        username: 'viewer1',
        password: 'viewer123',
        role: 'viewer',
        fullName: 'Mission Viewer',
        email: 'viewer@mission-control.space',
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    ];

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          (u) =>
            u.username === credentials.username && u.password === credentials.password && u.isActive
        );

        if (user) {
          const authenticatedUser = {
            ...user,
            lastLogin: new Date().toISOString(),
          };

          this.currentUser = authenticatedUser;
          localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
          resolve(authenticatedUser);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;

    const userPermissions = ROLE_PERMISSIONS[this.currentUser.role]?.permissions || [];
    return userPermissions.includes(permission);
  }

  hasRole(role: UserRole): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === role || this.currentUser.role === 'admin';
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    throw new Error('Will be implemented with backend');
  }

  async updateUser(userId: string, updates: UpdateUserRequest): Promise<User> {
    throw new Error('Will be implemented with backend');
  }

  async deleteUser(userId: string): Promise<void> {
    throw new Error('Will be implemented with backend');
  }

  async getAllUsers(): Promise<User[]> {
    throw new Error('Will be implemented with backend');
  }

  async refreshToken(): Promise<void> {
    throw new Error('Will be implemented with backend');
  }
}

export const authService = new AuthService();
