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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const StoresData: React.FC = () => {
  const chartRef = useRef<ChartJS<'bar'> | null>(null);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: adminApi.getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process users data to count by store
  const processUsersByStore = (users: User[]) => {
    const storeCounts: Record<string, number> = {};

    users.forEach(user => {
      const storeName = user.store ? user.store.name : 'No Store Assigned';
      storeCounts[storeName] = (storeCounts[storeName] || 0) + 1;
    });

    return storeCounts;
  };

  const storeCounts = users ? processUsersByStore(users) : {};
  const storeNames = Object.keys(storeCounts);
  const counts = Object.values(storeCounts);

  const chartData = {
    labels: storeNames,
    datasets: [
      {
        label: 'Number of Users',
        data: counts,
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',    // Green
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(245, 101, 101, 0.8)',  // Red
          'rgba(251, 191, 36, 0.8)',   // Yellow
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(20, 184, 166, 0.8)',   // Teal
          'rgba(251, 146, 60, 0.8)',   // Orange
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 101, 101, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(20, 184, 166, 1)',
          'rgba(251, 146, 60, 1)',
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
        text: 'Users Distribution by Store',
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
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Stores',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Loading stores data...</span>
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
          Users Distribution by Store
        </h3>
        <p className="text-gray-600 text-sm">
          Total users: {users.length} | Stores: {storeNames.length}
        </p>
      </div>

      <div className="h-96">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {storeNames.map((store, index) => (
          <div
            key={store}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate" title={store}>
                  {store}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {storeCounts[store]}
                </p>
                <p className="text-xs text-gray-500">
                  {store === 'No Store Assigned' ? 'Unassigned users' : 'employees'}
                </p>
              </div>
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 ml-2"
                style={{
                  backgroundColor: chartData.datasets[0].backgroundColor[index % 8],
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional stats */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {storeNames.filter(name => name !== 'No Store Assigned').length}
            </p>
            <p className="text-sm text-gray-600">Active Stores</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {storeCounts['No Store Assigned'] || 0}
            </p>
            <p className="text-sm text-gray-600">Unassigned Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {storeNames.length > 0 ? Math.round(users.length / storeNames.length) : 0}
            </p>
            <p className="text-sm text-gray-600">Avg Users per Store</p>
          </div>
        </div>
      </div>
    </div>
  );
};
