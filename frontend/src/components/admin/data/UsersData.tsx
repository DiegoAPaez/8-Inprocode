import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { adminApi } from '../../../services/api';
import type { User } from '../../../types/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const UsersData: React.FC = () => {
  const chartRef = useRef<ChartJS<'bar'> | null>(null);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: adminApi.getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process users data to count by role
  const processUsersByRole = (users: User[]) => {
    const roleCounts: Record<string, number> = {};

    users.forEach(user => {
      user.roles.forEach(role => {
        // Handle both string roles and role objects with name property
        const roleName = typeof role === 'string' ? role : role.name;
        if (roleName) {
          roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
        }
      });
    });

    return roleCounts;
  };

  const roleCounts = users ? processUsersByRole(users) : {};
  const roleNames = Object.keys(roleCounts);
  const counts = Object.values(roleCounts);

  const chartData = {
    labels: roleNames,
    datasets: [
      {
        label: 'Number of Users',
        data: counts,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 101, 101, 0.8)',  // Red
          'rgba(251, 191, 36, 0.8)',   // Yellow
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(236, 72, 153, 0.8)',   // Pink
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 101, 101, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
          },
          color: '#374151',
        },
      },
      title: {
        display: true,
        text: 'Users Distribution by Role',
        font: {
          size: 18,
          weight: 'bold',
        },
        color: '#1f2937',
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const total = counts.reduce((sum, count) => sum + count, 0);
            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
            return `${context.dataset.label}: ${context.parsed.y} (${percentage}%)`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'Number of Users',
          color: '#374151',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Roles',
          color: '#374151',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
  };

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading users data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading data</div>
          <div className="text-gray-600">Please try again later</div>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No users found</div>
          <div className="text-gray-400">Create some users to see the chart</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Users by Role Statistics
        </h3>
        <p className="text-gray-600 text-sm">
          Total users: {users.length} | Roles: {roleNames.length}
        </p>
      </div>

      <div className="h-96">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {roleNames.map((role, index) => (
          <div
            key={role}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{role}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roleCounts[role]}
                </p>
              </div>
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: chartData.datasets[0].backgroundColor[index % 6],
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
