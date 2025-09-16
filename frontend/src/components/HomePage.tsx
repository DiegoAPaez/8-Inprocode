import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from './admin/AdminDashboard.tsx';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render the appropriate dashboard based on user role
  if (user?.roles.includes('ADMIN')) {
    return <AdminDashboard />;
  }

  // For other roles, you can add different dashboards here
  return <AdminDashboard />; // For now, everyone gets admin dashboard
};
