import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../services/api';

interface ChangePasswordModalProps {
  user: { id: number; username: string };
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const [form, setForm] = useState<PasswordForm>({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: (passwordData: PasswordForm) => {
      return adminApi.changeUserPassword(user.id, passwordData);
    },
    onSuccess: () => {
      setForm({ newPassword: '', confirmPassword: '' });
      onClose();
      alert('Password updated successfully!');
    },
    onError: (error: unknown) => {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      alert('New password and confirmation do not match');
      return;
    }

    if (form.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    changePasswordMutation.mutate(form);
  };

  const handleClose = () => {
    setForm({ newPassword: '', confirmPassword: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Change Password: {user.username}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              required
              minLength={6}
              value={form.newPassword}
              onChange={(e) => {
                  setForm(prev => {
                      return ({...prev, newPassword: e.target.value});
                  });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              placeholder="Enter new password (min 6 characters)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              required
              value={form.confirmPassword}
              onChange={(e) => {
                  setForm(prev => {
                      return ({...prev, confirmPassword: e.target.value});
                  });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPasswords"
              checked={showPasswords}
              onChange={(e) => {
                  setShowPasswords(e.target.checked);
              }}
              className="mr-2"
            />
            <label htmlFor="showPasswords" className="text-sm text-gray-600">
              Show passwords
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
