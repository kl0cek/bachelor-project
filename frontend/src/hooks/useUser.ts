import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import type { User, UserRole } from '../types/types';
import type { UserFiltersBackend, PaginationParams } from '../types/apiTypes';

interface UseUsersOptions {
  filters?: UserFiltersBackend;
  pagination?: PaginationParams;
  autoLoad?: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getAllUsers(options.filters, options.pagination);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [options.filters, options.pagination]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      loadUsers();
    }
  }, [loadUsers, options.autoLoad]);

  const createUser = useCallback(
    async (userData: {
      username: string;
      password: string;
      full_name: string;
      email?: string;
      role: UserRole;
      is_active: boolean;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const newUser = await userService.createUser(userData);
        setUsers((prev) => [...prev, newUser]);
        return newUser;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUser = useCallback(
    async (
      id: string,
      updates: {
        username?: string;
        password?: string;
        fullName?: string;
        email?: string;
        role?: UserRole;
        isActive?: boolean;
      }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const updatedUser = await userService.updateUser(id, updates);
        setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)));
        return updatedUser;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await userService.toggleUserStatus(id);
      setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)));
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle user status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  };
};

export const useUser = (userId: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await userService.getUserById(userId);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    reload: loadUser,
  };
};
