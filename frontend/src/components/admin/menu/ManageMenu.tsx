import React from 'react';

export const ManageMenu: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200">
          Add New Item
        </button>
      </div>

      {/* Placeholder content - will be implemented when backend menu endpoints are ready */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Menu Management</h3>
        <p className="text-gray-600 mb-4">
          This section will allow you to manage restaurant menu items, categories, and pricing.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-800 mb-2">Menu Items</h4>
            <p className="text-sm text-gray-600">Add, edit, and remove menu items</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-800 mb-2">Categories</h4>
            <p className="text-sm text-gray-600">Organize items by categories</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-800 mb-2">Pricing</h4>
            <p className="text-sm text-gray-600">Manage item prices and specials</p>
          </div>
        </div>
      </div>
    </div>
  );
};
