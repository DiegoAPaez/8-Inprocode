import React from 'react';
import type { Store } from '../../../types/store';

interface StoreTableProps {
  stores: Store[];
  isLoading: boolean;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
  onViewUsers: (store: Store) => void;
}

export const StoreTable: React.FC<StoreTableProps> = ({
  stores,
  isLoading,
  onEdit,
  onDelete,
  onViewUsers,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">All Stores</h3>
        <p className="text-sm text-gray-600">
          Manage your restaurant locations
        </p>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No stores found. Create your first store location.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{store.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {store.latitude.toFixed(6)}, {store.longitude.toFixed(6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onViewUsers(store)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Users
                    </button>
                    <button
                      onClick={() => onEdit(store)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(store)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
