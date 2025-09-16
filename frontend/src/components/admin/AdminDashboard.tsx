import React, {useState} from 'react';
import {useAuth} from '../../contexts/AuthContext.tsx';
import {ManageUsers} from './users/ManageUsers.tsx';
import {ManageMenu} from './menu/ManageMenu.tsx';
import {ManageData} from './data/ManageData.tsx';
import {ManageStores} from './stores/ManageStores.tsx';
import {ManageSchedule} from "./calendar/ManageSchedule.tsx";

export const AdminDashboard: React.FC = () => {
    const {user, logout} = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'menu' | 'data' | 'stores' | 'schedule'>('users');

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const tabs = [
        {id: 'users' as const, label: 'Manage Users', icon: '👥'},
        {id: 'menu' as const, label: 'Manage Menu', icon: '🍽️'},
        {id: 'data' as const, label: 'Manage Data', icon: '📊'},
        {id: 'stores' as const, label: 'Manage Stores', icon: '🏪'},
        {id: 'schedule' as const, label: 'Manage Schedule', icon: '📅'}
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'users':
                return <ManageUsers/>;
            case 'menu':
                return <ManageMenu/>;
            case 'data':
                return <ManageData/>;
            case 'stores':
                return <ManageStores/>;
            case 'schedule':
                return <ManageSchedule/>;
            default:
                return <ManageUsers/>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Restaurant ERP</h1>
                            <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Admin Dashboard
              </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user?.username}</span>
                            <button
                                onClick={() => {
                                    void handleLogout();
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id)
                                }}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow">
                    {renderActiveTab()}
                </div>
            </main>
        </div>
    );
};
