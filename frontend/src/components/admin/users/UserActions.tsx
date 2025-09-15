import React from 'react';

interface UserActionsProps {
  onRefresh: () => void;
  onToggleCreateForm: () => void;
  isRefreshing: boolean;
  showCreateForm: boolean;
}

export const UserActions: React.FC<UserActionsProps> = ({
  onRefresh,
  onToggleCreateForm,
  isRefreshing,
  showCreateForm
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
      <div className="flex space-x-3">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 disabled:opacity-50 flex items-center"
        >
          {isRefreshing ? (
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
          onClick={onToggleCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          {showCreateForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>
    </div>
  );
};
