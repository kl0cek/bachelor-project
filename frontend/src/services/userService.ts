import { apiClient } from '../api/client';
import type {
  CreateUserBackendRequest,
  PaginationParams,
  UpdateUserBackendRequest,
  UserFiltersBackend,
} from '../types/apiTypes';
import type { User } from '../types/auth';

interface BackendUser {
  id: string;
  username: string;
  password: string;
  full_name: string;
  email?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface PaginatedResponse {
  data: BackendUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const mapBackendUserToFrontend = (backendUser: BackendUser): User => {
  return {
    id: backendUser.id,
    username: backendUser.username,
    password: backendUser.password,
    fullName: backendUser.full_name,
    email: backendUser.email,
    role: backendUser.role as User['role'],
    isActive: backendUser.is_active,
    createdAt: backendUser.created_at,
    lastLogin: backendUser.last_login,
  };
};

class UserService {
  async getAllUsers(filters?: UserFiltersBackend, pagination?: PaginationParams) {
    const response = await apiClient.get<{ success: boolean } & PaginatedResponse>('/users', {
      params: { ...filters, ...pagination },
    });

    return {
      data: response.data.data.map(mapBackendUserToFrontend),
      pagination: response.data.pagination,
    };
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: BackendUser }>(`/users/${id}`);
    return mapBackendUserToFrontend(response.data.data);
  }

  async createUser(userData: CreateUserBackendRequest): Promise<User> {
    const response = await apiClient.post<{ success: boolean; data: BackendUser }>('/users', {
      username: userData.username,
      password: userData.password,
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role,
      is_active: userData.is_active,
    });
    return mapBackendUserToFrontend(response.data.data);
  }

  async updateUser(id: string, updates: UpdateUserBackendRequest): Promise<User> {
    const response = await apiClient.patch<{ success: boolean; data: BackendUser }>(
      `/users/${id}`,
      {
        username: updates.username,
        password: updates.password,
        full_name: updates.full_name,
        email: updates.email,
        role: updates.role,
        is_active: updates.is_active,
      }
    );
    return mapBackendUserToFrontend(response.data.data);
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  async toggleUserStatus(id: string): Promise<User> {
    const response = await apiClient.patch<{ success: boolean; data: BackendUser }>(
      `/users/${id}/toggle`
    );
    return mapBackendUserToFrontend(response.data.data);
  }
}

export const userService = new UserService();
