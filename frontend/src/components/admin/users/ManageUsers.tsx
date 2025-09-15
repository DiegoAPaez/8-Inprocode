import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../services/api.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { ChangePasswordModal } from './ChangePasswordModal.tsx';
import { UserActions } from './UserActions.tsx';
import { UserForm, type CreateUserForm, type UpdateUserForm } from './UserForm.tsx';
import { UserTable } from './UserTable.tsx';
import type { User } from "../../../types/auth.ts";
import type { Store } from "../../../types/store.ts";

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

  // Event handlers
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
        : userToEdit.roles[0]?.name ?? 'ADMIN',
      storeId: userToEdit.store?.id?.toString() ?? '' // Use store.id from the nested store object
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

  const handleToggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setEditingUser(null); // Close edit form if open
  };

  const handleChangePassword = (userToChange: User) => {
    setPasswordChangeUser(userToChange);
  };

  const handleClosePasswordModal = () => {
    setPasswordChangeUser(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
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
      {/* Header Actions */}
      <UserActions
        onRefresh={handleRefresh}
        onToggleCreateForm={handleToggleCreateForm}
        isRefreshing={isFetching}
        showCreateForm={showCreateForm}
      />

      {/* Create User Form */}
      {showCreateForm && (
        <UserForm
          type="create"
          stores={stores}
          createForm={createForm}
          onCreateSubmit={handleCreateUser}
          onUpdateSubmit={handleUpdateUser}
          onCreateChange={setCreateForm}
          onUpdateChange={setUpdateForm}
          onCancel={handleToggleCreateForm}
          isLoading={createUserMutation.isPending}
        />
      )}

      {/* Edit User Form */}
      {editingUser && (
        <UserForm
          type="edit"
          user={editingUser}
          stores={stores}
          updateForm={updateForm}
          onCreateSubmit={handleCreateUser}
          onUpdateSubmit={handleUpdateUser}
          onCreateChange={setCreateForm}
          onUpdateChange={setUpdateForm}
          onCancel={handleCancelEdit}
          isLoading={updateUserMutation.isPending}
        />
      )}

      {/* Users Table */}
      <UserTable
        users={users}
        onEdit={handleEditClick}
        onChangePassword={handleChangePassword}
        onDelete={handleDeleteUser}
        isDeleting={deleteUserMutation.isPending}
      />

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
