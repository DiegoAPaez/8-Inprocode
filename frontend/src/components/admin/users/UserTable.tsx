import React from 'react';
import type {User} from "../../../types/auth.ts";

interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onChangePassword: (user: User) => void;
    onDelete: (id: number) => void;
    isDeleting: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
                                                        users,
                                                        onEdit,
                                                        onChangePassword,
                                                        onDelete,
                                                        isDeleting
                                                    }) => {
    return (
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
                {users.map((user: User) => (
                    <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.store ? (
                                <span
                                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {user.store.name}
                  </span>
                            ) : (
                                <span
                                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
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
                                onClick={() => {
                                    onEdit(user);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    onChangePassword(user);
                                }}
                                className="text-yellow-600 hover:text-yellow-900"
                            >
                                Password
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(user.id);
                                }}
                                disabled={isDeleting}
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
    );
};
