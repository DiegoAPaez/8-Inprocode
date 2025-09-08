import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import type {User} from "../../types/auth.ts";
import type { Store } from "../../types/store.ts";

// interface User {
//   id: number;
//   username: string;
//   email: string;
//   roles: string[];
// }

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  role: string;
  storeId: string; // Empty string for no store, or store ID as string
}

interface UpdateUserForm {
  username: string;
  email: string;
  role: string;
  storeId: string; // Empty string for no store, or store ID as string
}

export const ManageUsers: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
    storeId: '' // Default to no store
  });
  const [updateForm, setUpdateForm] = useState<UpdateUserForm>({
    username: '',
    email: '',
    role: 'ADMIN',
    storeId: '' // Default to no store
  });
  const queryClient = useQueryClient();

  // Optimized users query with caching
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: adminApi.getAllUsers,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    refetchOnMount: false, // Don't refetch if data exists in cache
    enabled: isAuthenticated, // Only fetch if user is authenticated
  });

  // Fetch stores for dropdown selection
  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: adminApi.getAllStores,
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserForm) => {
      // Transform single role to roles array for backend
      const payload = {
        ...userData,
        roles: [userData.role],
        storeId: userData.storeId === '' ? null : Number(userData.storeId)
      };
      return adminApi.createUser(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateForm(false);
      setCreateForm({ username: '', email: '', password: '', role: 'ADMIN', storeId: '' });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UpdateUserForm }) => {
      const payload = {
        ...userData,
        storeId: userData.storeId === '' ? null : Number(userData.storeId)
      };
      return adminApi.updateUser(id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      setUpdateForm({ username: '', email: '', role: 'ADMIN', storeId: '' });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(createForm);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        userData: updateForm
      });
    }
  };

  const handleEditClick = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setUpdateForm({
      username: userToEdit.username,
      email: userToEdit.email,
      // Handle both string array and object array formats for roles
      role: typeof userToEdit.roles[0] === 'string'
        ? userToEdit.roles[0] as string
        : userToEdit.roles[0]?.name || 'ADMIN',
      storeId: userToEdit.store?.id?.toString() || '' // Use store.id from the nested store object
    });
    setShowCreateForm(false); // Close create form if open
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setUpdateForm({ username: '', email: '', role: 'ADMIN', storeId: '' });
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleRefresh = () => {
    void refetch();
  };

  const handleChangePassword = (userToChange: User) => {
    setPasswordChangeUser(userToChange);
  };

  const handleClosePasswordModal = () => {
    setPasswordChangeUser(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading users. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 disabled:opacity-50 flex items-center"
          >
            {isFetching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingUser(null); // Close edit form if open
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            {showCreateForm ? 'Cancel' : 'Add New User'}
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={createForm.username}
                onChange={(e) => { setCreateForm(prev => ({ ...prev, username: e.target.value })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => { setCreateForm(prev => ({ ...prev, email: e.target.value })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={createForm.password}
                onChange={(e) => { setCreateForm(prev => ({ ...prev, password: e.target.value })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={createForm.role}
                onChange={(e) => { setCreateForm(prev => ({ ...prev, role: e.target.value })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="ADMIN">Admin</option>
                <option value="CASHIER">Cashier</option>
                <option value="WAITER">Waiter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
              <select
                value={createForm.storeId}
                onChange={(e) => { setCreateForm(prev => ({ ...prev, storeId: e.target.value })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="">No Store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50"
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-4">Edit User: {editingUser.username}</h3>
          <form onSubmit={handleUpdateUser} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={updateForm.username}
                onChange={(e) => { setUpdateForm(prev => ({ ...prev, username: e.target.value })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={updateForm.email}
                onChange={(e) => { setUpdateForm(prev => ({ ...prev, email: e.target.value })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={updateForm.role}
                onChange={(e) => { setUpdateForm(prev => ({ ...prev, role: e.target.value })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="ADMIN">Admin</option>
                <option value="CASHIER">Cashier</option>
                <option value="WAITER">Waiter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
              <select
                value={updateForm.storeId}
                onChange={(e) => { setUpdateForm(prev => ({ ...prev, storeId: e.target.value })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                <option value="">No Store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(users).map((user: User) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.store ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {user.store.name}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      No Store
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.roles.map((role, index) => (
                    <span
                      key={typeof role === 'string' ? role : role.name || index}
                      className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mr-1"
                    >
                      {typeof role === 'string' ? role : role.name}
                    </span>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => { handleEditClick(user); }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { handleChangePassword(user); }}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    Password
                  </button>
                  <button
                    onClick={() => { handleDeleteUser(user.id); }}
                    disabled={deleteUserMutation.isPending}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Change Modal */}
      {passwordChangeUser && (
        <ChangePasswordModal
          user={passwordChangeUser}
          isOpen={!!passwordChangeUser}
          onClose={handleClosePasswordModal}
        />
      )}
    </div>
  );
};
