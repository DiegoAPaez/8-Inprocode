import React from 'react';
import { FaCalendarWeek, FaCalendarDay, FaPlus } from 'react-icons/fa';

interface CalendarHeaderProps {
  currentView: 'timeGridWeek' | 'timeGridDay';
  onViewChange: (view: 'timeGridWeek' | 'timeGridDay') => void;
  onCreateEvent: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentView,
  onViewChange,
  onCreateEvent,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">Staff Schedule</h2>

      <div className="flex gap-2">
        {/* View Toggle Buttons */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewChange('timeGridWeek')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'timeGridWeek'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <FaCalendarWeek />
            Week
          </button>
          <button
            onClick={() => onViewChange('timeGridDay')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'timeGridDay'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <FaCalendarDay />
            Day
          </button>
        </div>

        {/* Add Event Button */}
        <button
          onClick={onCreateEvent}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <FaPlus />
          Add Shift
        </button>
      </div>
    </div>
  );
};
