import { apiClient } from '../api/client';
import type { User, UserRole } from '../types/types';

export interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    role: string;
    full_name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_login: string;
  };
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'create_mission',
    'edit_mission',
    'delete_mission',
    'manage_crew',
    'view_schedule',
    'manage_activities',
    'manage_users',
    'view_all_missions',
  ],
  operator: [
    'create_mission',
    'edit_mission',
    'manage_crew',
    'view_schedule',
    'manage_activities',
    'view_all_missions',
  ],
  astronaut: ['view_schedule', 'view_own_activities', 'edit_own_activities'],
  viewer: ['view_schedule', 'view_all_missions'],
};

class AuthService {
  private currentUser: User | null = null;
  private isLoggingOut: boolean = false;
  private isInitialized: boolean = false;

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: LoginResponse;
        message: string;
      }>('/auth/login', credentials);

      const { user } = response.data.data;

      const mappedUser: User = {
        id: user.id,
        username: user.username,
        password: '',
        role: user.role as UserRole,
        fullName: user.full_name,
        email: user.email,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      };

      localStorage.setItem('currentUser', JSON.stringify(mappedUser));
      this.currentUser = mappedUser;
      this.isInitialized = true;

      return mappedUser;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    try {
      await apiClient.post(
        '/auth/logout',
        {},
        {
          timeout: 3000,
        }
      );
    } catch (error) {
      console.log('Logout API call failed (this is OK):', error);
    } finally {
      this.clearAuth();
      this.isLoggingOut = false;
      this.isInitialized = false;
      window.location.href = '/login';
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || !localStorage.getItem('currentUser')) {
      return;
    }

    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/auth/me');
      const user = response.data.data;

      const mappedUser: User = {
        id: user.id,
        username: user.username,
        password: '',
        role: user.role as UserRole,
        fullName: user.full_name,
        email: user.email,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      };

      localStorage.setItem('currentUser', JSON.stringify(mappedUser));
      this.currentUser = mappedUser;
      this.isInitialized = true;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.clearAuth();
      this.isInitialized = false;
    }
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (this.isValidUser(user)) {
          this.currentUser = user;
          return this.currentUser;
        }
      } catch {
        this.clearAuth();
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === role;
  }

  private clearAuth(): void {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.isInitialized = false;
  }

  private isValidUser(user: any): boolean {
    return (
      user &&
      typeof user.id === 'string' &&
      typeof user.username === 'string' &&
      typeof user.role === 'string' &&
      ['admin', 'operator', 'astronaut', 'viewer'].includes(user.role)
    );
  }
}

export const authService = new AuthService();
