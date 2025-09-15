import React from 'react';
import type { Store } from '../../../types/store';
import type { User } from '../../../types/auth';

interface StoreUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  users: User[];
  isLoading?: boolean;
}

export const StoreUsersModal: React.FC<StoreUsersModalProps> = ({
  isOpen,
  onClose,
  store,
  users,
  isLoading = false,
}) => {
  if (!isOpen || !store) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Users at {store.name}
        </h3>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No users assigned to this store.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.roles.map(role => role.name).join(', ') || 'No roles'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
