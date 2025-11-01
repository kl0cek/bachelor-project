// src/services/userService.ts
import { apiClient } from '../api/client';
import type { User } from '../types/auth';

class UserService {
  async getAllUsers(filters?: any, pagination?: any) {
    const response = await apiClient.get('/users', {
      params: { ...filters, ...pagination },
    });
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  }

  async createUser(userData: any): Promise<User> {
    const response = await apiClient.post('/users', {
      username: userData.username,
      password: userData.password,
      full_name: userData.fullName,
      email: userData.email,
      role: userData.role,
      is_active: userData.isActive,
    });
    return response.data.data;
  }

  async updateUser(id: string, updates: any): Promise<User> {
    const response = await apiClient.patch(`/users/${id}`, {
      username: updates.username,
      password: updates.password,
      full_name: updates.fullName,
      email: updates.email,
      role: updates.role,
      is_active: updates.isActive,
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
