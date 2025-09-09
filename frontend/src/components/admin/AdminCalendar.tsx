import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FaCalendarWeek, FaCalendarDay, FaPlus, FaTimes } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/api';

interface EventInfo {
  event: {
    title: string;
    id: string;
  };
}

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

export const AdminCalendar: React.FC = () => {
  const [currentView, setCurrentView] = useState<'timeGridWeek' | 'timeGridDay'>('timeGridWeek');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState<SelectInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateClickInfo | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Fetch users for selection
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: adminApi.getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sample events data - this would come from your API
  const [events] = useState([
    {
      id: '1',
      title: 'Morning Shift - John Doe',
      start: '2025-09-09T09:00:00',
      end: '2025-09-09T17:00:00',
      backgroundColor: '#3b82f6',
      borderColor: '#2563eb',
      textColor: '#ffffff',
    },
    {
      id: '2',
      title: 'Evening Shift - Jane Smith',
      start: '2025-09-09T17:00:00',
      end: '2025-09-10T01:00:00',
      backgroundColor: '#10b981',
      borderColor: '#059669',
      textColor: '#ffffff',
    },
    {
      id: '3',
      title: 'Kitchen Staff - Mike Johnson',
      start: '2025-09-10T08:00:00',
      end: '2025-09-10T16:00:00',
      backgroundColor: '#f59e0b',
      borderColor: '#d97706',
      textColor: '#ffffff',
    },
  ]);

  const handleDateClick = (arg: DateClickInfo) => {
    console.log('Date clicked:', arg.dateStr);
    setSelectedDate(arg);
    setSelectedRange(null);
    setShowCreateModal(true);
  };

  const handleDateSelect = (selectInfo: SelectInfo) => {
    console.log('Date range selected:', selectInfo);
    setSelectedRange(selectInfo);
    setSelectedDate(null);
    setShowCreateModal(true);
  };

  const handleEventClick = (clickInfo: EventInfo) => {
    console.log('Event clicked:', clickInfo.event.title);
    // Handle event click - could open a modal to edit event
  };

  const handleViewChange = (view: 'timeGridWeek' | 'timeGridDay') => {
    setCurrentView(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
    }
  };

  const handleCreateEvent = (eventData: CreateEventData) => {
    const startDate = new Date(eventData.start);
    const endDate = new Date(eventData.end);

    // Calculate duration in hours with proper date handling
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    console.log('Creating new shift event:', {
      userId: eventData.userId,
      userName: users.find(u => u.id === eventData.userId)?.username || 'Unknown User',
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      duration: `${durationHours.toFixed(1)} hours`
    });

    setShowCreateModal(false);
    setSelectedRange(null);
    setSelectedDate(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Custom CSS for FullCalendar styling */}
      <style>{`
        .fc {
          background: white;
        }
        
        .fc-theme-standard td, 
        .fc-theme-standard th {
          border-color: #e5e7eb !important;
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border-color: #e5e7eb !important;
        }
        
        .fc-col-header-cell {
          background-color: #f9fafb !important;
          color: #374151 !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #e5e7eb !important;
        }
        
        .fc-timegrid-slot {
          border-color: #f3f4f6 !important;
        }
        
        .fc-timegrid-slot-label {
          color: #6b7280 !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
        }
        
        .fc-daygrid-day-number, 
        .fc-col-header-cell-cushion {
          color: #374151 !important;
          font-weight: 600 !important;
        }
        
        .fc-button {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: white !important;
          font-weight: 500 !important;
        }
        
        .fc-button:hover {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }
        
        .fc-button:disabled {
          background-color: #9ca3af !important;
          border-color: #9ca3af !important;
        }
        
        .fc-today {
          background-color: #eff6ff !important;
        }
        
        .fc-daygrid-day:hover,
        .fc-timegrid-col:hover {
          background-color: #f8fafc !important;
        }
        
        .fc-event {
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          border-radius: 4px !important;
          padding: 2px 4px !important;
        }
        
        .fc-event:hover {
          opacity: 0.9 !important;
          transform: translateY(-1px) !important;
          transition: all 0.2s ease !important;
        }
        
        .fc-toolbar-title {
          color: #1f2937 !important;
          font-weight: 700 !important;
          font-size: 1.5rem !important;
        }
        
        .fc-direction-ltr .fc-toolbar > * > :not(:first-child) {
          margin-left: 0.5rem !important;
        }
        
        .fc-timegrid-axis {
          border-color: #e5e7eb !important;
        }
        
        .fc-timegrid-divider {
          border-color: #e5e7eb !important;
        }
        
        .fc-business-hours {
          background-color: #f8fafc !important;
        }
        
        .fc-non-business {
          background-color: #f9fafb !important;
        }
        
        .fc-highlight {
          background-color: #dbeafe !important;
        }
      `}</style>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Staff Schedule</h2>

        <div className="flex gap-2">
          {/* View Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewChange('timeGridWeek')}
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
              onClick={() => handleViewChange('timeGridDay')}
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <FaPlus />
            Add Shift
          </button>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="calendar-container bg-white border border-gray-200 rounded-lg overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '', // We're using custom view buttons above
          }}
          initialView={currentView}
          events={events}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          dateClick={handleDateClick}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="600px"
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          allDaySlot={false}
          nowIndicator={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // Monday - Sunday
            startTime: '08:00',
            endTime: '23:00',
          }}
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          dayHeaderFormat={{
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          }}
        />
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedRange(null);
            setSelectedDate(null);
          }}
          onSubmit={handleCreateEvent}
          users={users}
          selectedRange={selectedRange}
          selectedDate={selectedDate}
        />
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Shift Types</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Morning Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Evening Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-sm text-gray-600">Kitchen Staff</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Event Modal Component
interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CreateEventData) => void;
  users: any[];
  selectedRange: SelectInfo | null;
  selectedDate: DateClickInfo | null;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
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

  React.useEffect(() => {
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
