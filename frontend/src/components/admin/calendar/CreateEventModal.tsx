import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface DateClickInfo {
  dateStr: string;
  date: Date;
}

interface SelectInfo {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
}

interface CreateEventData {
  userId: number;
  title: string;
  start: string;
  end: string;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CreateEventData) => void;
  users: any[];
  selectedRange: SelectInfo | null;
  selectedDate: DateClickInfo | null;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users,
  selectedRange,
  selectedDate
}) => {
  const [userId, setUserId] = useState<number>(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (selectedRange) {
      setStartDate(selectedRange.startStr.split('T')[0]);
      setEndDate(selectedRange.endStr.split('T')[0]);
      setStartTime(selectedRange.startStr.split('T')[1]?.substring(0, 5) || '09:00');
      setEndTime(selectedRange.endStr.split('T')[1]?.substring(0, 5) || '17:00');
    } else if (selectedDate) {
      setStartDate(selectedDate.dateStr);
      setEndDate(selectedDate.dateStr);
      setStartTime('09:00');
      setEndTime('17:00');
    }
  }, [selectedRange, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !startDate || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedUser = users.find(u => u.id === userId);

    const eventData: CreateEventData = {
      userId,
      title: `${selectedUser?.username || 'Unknown'}`,
      start: `${startDate}T${startTime}:00`,
      end: `${endDate}T${endTime}:00`
    };

    onSubmit(eventData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Create New Shift</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to User *
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              required
            >
              <option value={0}>Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} - {user.roles?.join(', ') || 'No role'}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
              />
            </div>
          </div>

          {/* End Date (for multi-day shifts) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">Leave same as start date for single-day shifts</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
