import React from 'react';
import type { User } from "../../../types/auth.ts";
import type { Store } from "../../../types/store.ts";

export interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  role: string;
  storeId: string; // Empty string for no store, or store ID as string
}

export interface UpdateUserForm {
  username: string;
  email: string;
  role: string;
  storeId: string; // Empty string for no store, or store ID as string
}

interface UserFormProps {
  type: 'create' | 'edit';
  user?: User;
  stores: Store[];
  createForm?: CreateUserForm;
  updateForm?: UpdateUserForm;
  onCreateSubmit: (e: React.FormEvent) => void;
  onUpdateSubmit: (e: React.FormEvent) => void;
  onCreateChange: (form: CreateUserForm) => void;
  onUpdateChange: (form: UpdateUserForm) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  type,
  user,
  stores,
  createForm,
  updateForm,
  onCreateSubmit,
  onUpdateSubmit,
  onCreateChange,
  onUpdateChange,
  onCancel,
  isLoading
}) => {
  const isEdit = type === 'edit';
  const formData = isEdit ? updateForm : createForm;

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      onUpdateSubmit(e);
    } else {
      onCreateSubmit(e);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (isEdit && updateForm) {
      onUpdateChange({ ...updateForm, [field]: value });
    } else if (!isEdit && createForm) {
      onCreateChange({ ...createForm, [field]: value });
    }
  };

  return (
    <div className={`mb-6 p-4 rounded-lg ${isEdit ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
      <h3 className="text-lg font-semibold mb-4">
        {isEdit ? `Edit User: ${user?.username}` : 'Create New User'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => {
                handleChange('username', e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => {
                handleChange('email', e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
          />
        </div>
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={(formData as CreateUserForm).password || ''}
              onChange={(e) => {
                  handleChange('password', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={formData.role}
            onChange={(e) => {
                handleChange('role', e.target.value);
            }}
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
            value={formData.storeId}
            onChange={(e) => {
                handleChange('storeId', e.target.value);
            }}
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
        <div className={`${isEdit ? 'flex space-x-3' : 'col-span-2'}`}>
          <button
            type="submit"
            disabled={isLoading}
            className={`${isEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-md transition duration-200 disabled:opacity-50`}
          >
            {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update User' : 'Create User')}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
