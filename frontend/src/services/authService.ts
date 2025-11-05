import { apiClient } from '../api/client';
import type { User } from '../types/types';

export interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
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

const ROLE_PERMISSIONS: Record<string, string[]> = {
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
  astronaut: [
    'view_schedule',
    'view_own_activities',
    'edit_own_activities',
  ],
  viewer: [
    'view_schedule',
    'view_all_missions',
  ],
};

class AuthService {
  private currentUser: User | null = null;

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiClient.post<{ success: boolean; data: LoginResponse; message: string }>(
      '/auth/login',
      credentials
    );

    const { user } = response.data.data;

    const mappedUser: User = {
      id: user.id,
      username: user.username,
      password: '',
      role: user.role as any,
      fullName: user.full_name,
      email: user.email,
      isActive: user.is_active,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    };

    localStorage.setItem('currentUser', JSON.stringify(mappedUser));
    this.currentUser = mappedUser;

    return mappedUser;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('currentUser');
      this.currentUser = null;
    }
  }

  async initialize(): Promise<void> {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      this.currentUser = null;
      return;
    }
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/auth/me');
      const user = response.data.data;

      const mappedUser: User = {
        id: user.id,
        username: user.username,
        password: '',
        role: user.role as any,
        fullName: user.full_name,
        email: user.email,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      };

      this.currentUser = mappedUser;
      localStorage.setItem('currentUser', JSON.stringify(mappedUser));
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      this.currentUser = null;
      localStorage.removeItem('currentUser');
    }
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        return this.currentUser;
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        return null;
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  getStoredUser(): User | null {
    return this.getCurrentUser();
  }
}

export const authService = new AuthService();
