import { useState } from 'react';
import { UserPlus, Edit, Trash2, Shield, Eye, User as UserIcon } from 'lucide-react';
import { Card, Button } from '../components/ui/index';
import { ROLE_PERMISSIONS } from '../utils/auth';
import type { UserRole } from '../types/auth';
import { useUsers } from '../hooks/useUser';

export const UserManagement = () => {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers({
    autoLoad: true,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'viewer' as UserRole,
    isActive: true,
  });

  const handleCreateUser = async () => {
    try {
      await createUser(formData);
      resetForm();
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  const handleUpdateUser = async () => {
    if (editingUser) {
      try {
        const updates: Partial<typeof formData> = { ...formData };
        if (!updates.password) {
          delete updates.password;
        }

        await updateUser(editingUser.id, updates);
        resetForm();
        setEditingUser(null);
      } catch (err) {
        console.error('Failed to update user:', err);
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      role: 'viewer',
      isActive: true,
    });
  };

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      operator: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      astronaut: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    };

    const icons = {
      admin: Shield,
      operator: UserIcon,
      astronaut: UserIcon,
      viewer: Eye,
    };

    const Icon = icons[role];

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${colors[role]}`}
      >
        <Icon className="h-3 w-3" />
        {ROLE_PERMISSIONS[role].label}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              User Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage system users and their permissions
            </p>
          </div>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {(isCreating || editingUser) && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="username"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Password {editingUser ? '' : '*'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder={editingUser ? 'Leave blank to keep current' : '••••••••'}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="user@example.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                disabled={loading}
              >
                {Object.entries(ROLE_PERMISSIONS).map(([role, info]) => (
                  <option key={role} value={role}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
                disabled={loading}
              />
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Active Account
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                setIsCreating(false);
                setEditingUser(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={editingUser ? handleUpdateUser : handleCreateUser} disabled={loading}>
              <span className="dark:text-white text-sky-950">
                {loading ? 'Processing...' : editingUser ? 'Update User' : 'Create User'}
              </span>
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        {loading && users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Last Login
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {user.fullName}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          @{user.username}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setFormData({
                              username: user.username,
                              password: '',
                              fullName: user.fullName,
                              email: user.email || '',
                              role: user.role,
                              isActive: user.isActive,
                            });
                          }}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserManagement;
