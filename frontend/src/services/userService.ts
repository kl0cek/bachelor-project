import { apiClient } from '../api/client';
import type {
  CreateUserBackendRequest,
  PaginationParams,
  UpdateUserBackendRequest,
  UserFiltersBackend,
} from '../types/apiTypes';
import type { User } from '../types/auth';

class UserService {
  async getAllUsers(filters?: UserFiltersBackend, pagination?: PaginationParams) {
    const response = await apiClient.get('/users', {
      params: { ...filters, ...pagination },
    });
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  }

  async createUser(userData: CreateUserBackendRequest): Promise<User> {
    const response = await apiClient.post('/users', {
      username: userData.username,
      password: userData.password,
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role,
      is_active: userData.is_active,
    });
    return response.data.data;
  }

  async updateUser(id: string, updates: UpdateUserBackendRequest): Promise<User> {
    const response = await apiClient.patch(`/users/${id}`, {
      username: updates.username,
      password: updates.password,
      full_name: updates.full_name,
      email: updates.email,
      role: updates.role,
      is_active: updates.is_active,
    });
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  async toggleUserStatus(id: string): Promise<User> {
    const response = await apiClient.patch(`/users/${id}/toggle`);
    return response.data.data;
  }
}

export const userService = new UserService();
