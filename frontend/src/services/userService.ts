import type { User, UserRole } from '../types/auth';

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

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class UserService {
  private users: User[] = [
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

  async getAllUsers(
    filters?: UserFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<User>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredUsers = [...this.users];

        if (filters?.role) {
          filteredUsers = filteredUsers.filter((u) => u.role === filters.role);
        }

        if (filters?.isActive !== undefined) {
          filteredUsers = filteredUsers.filter((u) => u.isActive === filters.isActive);
        }

        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredUsers = filteredUsers.filter(
            (u) =>
              u.fullName.toLowerCase().includes(searchTerm) ||
              u.username.toLowerCase().includes(searchTerm) ||
              u.email?.toLowerCase().includes(searchTerm)
          );
        }

        const usersWithoutPasswords = filteredUsers.map((u) => ({
          ...u,
          password: '****',
        }));

        const total = usersWithoutPasswords.length;

        if (pagination) {
          const start = (pagination.page - 1) * pagination.limit;
          const end = start + pagination.limit;
          const paginatedUsers = usersWithoutPasswords.slice(start, end);

          resolve({
            data: paginatedUsers,
            total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(total / pagination.limit),
          });
        } else {
          resolve({
            data: usersWithoutPasswords,
            total,
            page: 1,
            limit: total,
            totalPages: 1,
          });
        }
      }, 300);
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.users.find((u) => u.id === id);
        if (user) {
          resolve({ ...user, password: '****' });
        } else {
          resolve(null);
        }
      }, 200);
    });
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = this.users.find(
          (u) => u.username === userData.username || (userData.email && u.email === userData.email)
        );

        if (existingUser) {
          reject(new Error('Username or email already exists'));
          return;
        }

        const newUser: User = {
          id: `user-${Date.now()}`,
          ...userData,
          createdAt: new Date().toISOString(),
        };

        this.users.push(newUser);
        resolve({ ...newUser, password: '****' });
      }, 400);
    });
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = this.users.findIndex((u) => u.id === id);

        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }

        if (updates.username || updates.email) {
          const existingUser = this.users.find(
            (u) =>
              u.id !== id &&
              ((updates.username && u.username === updates.username) ||
                (updates.email && u.email === updates.email))
          );

          if (existingUser) {
            reject(new Error('Username or email already exists'));
            return;
          }
        }

        this.users[userIndex] = {
          ...this.users[userIndex],
          ...updates,
        };

        resolve({ ...this.users[userIndex], password: '****' });
      }, 400);
    });
  }

  async deleteUser(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = this.users.findIndex((u) => u.id === id);

        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }

        if (
          this.users[userIndex].role === 'admin' &&
          this.users.filter((u) => u.role === 'admin').length === 1
        ) {
          reject(new Error('Cannot delete the last admin user'));
          return;
        }

        this.users.splice(userIndex, 1);
        resolve();
      }, 300);
    });
  }

  async toggleUserStatus(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = this.users.findIndex((u) => u.id === id);

        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }

        if (this.users[userIndex].role === 'admin' && this.users[userIndex].isActive) {
          const activeAdmins = this.users.filter((u) => u.role === 'admin' && u.isActive);
          if (activeAdmins.length === 1) {
            reject(new Error('Cannot deactivate the last active admin'));
            return;
          }
        }

        this.users[userIndex].isActive = !this.users[userIndex].isActive;
        resolve({ ...this.users[userIndex], password: '****' });
      }, 300);
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find((u) => u.id === id);

        if (!user) {
          reject(new Error('User not found'));
          return;
        }

        if (user.password !== currentPassword) {
          reject(new Error('Current password is incorrect'));
          return;
        }

        user.password = newPassword;
        resolve();
      }, 300);
    });
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find((u) => u.id === id);

        if (!user) {
          reject(new Error('User not found'));
          return;
        }

        user.password = newPassword;
        resolve();
      }, 300);
    });
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const result = await this.getAllUsers({ role });
    return result.data;
  }

  async getActiveUsers(): Promise<User[]> {
    const result = await this.getAllUsers({ isActive: true });
    return result.data;
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    const result = await this.getAllUsers({ search: searchTerm });
    return result.data;
  }

  validateUserData(userData: CreateUserRequest | UpdateUserRequest): string[] {
    const errors: string[] = [];

    if ('username' in userData && userData.username) {
      if (userData.username.length < 3) {
        errors.push('Username must be at least 3 characters');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
      }
    }

    if ('password' in userData && userData.password) {
      if (userData.password.length < 6) {
        errors.push('Password must be at least 6 characters');
      }
    }

    if ('email' in userData && userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Invalid email format');
      }
    }

    if ('fullName' in userData && userData.fullName) {
      if (userData.fullName.length < 2) {
        errors.push('Full name must be at least 2 characters');
      }
    }

    return errors;
  }

  getUserStats(): {
    total: number;
    byRole: Record<UserRole, number>;
    active: number;
    inactive: number;
  } {
    const total = this.users.length;
    const active = this.users.filter((u) => u.isActive).length;
    const inactive = total - active;

    const byRole: Record<UserRole, number> = {
      admin: this.users.filter((u) => u.role === 'admin').length,
      operator: this.users.filter((u) => u.role === 'operator').length,
      astronaut: this.users.filter((u) => u.role === 'astronaut').length,
      viewer: this.users.filter((u) => u.role === 'viewer').length,
    };

    return { total, byRole, active, inactive };
  }
}

export const userService = new UserService();
