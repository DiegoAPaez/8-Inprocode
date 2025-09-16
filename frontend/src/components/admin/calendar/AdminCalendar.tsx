import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../services/api';
import { CalendarHeader } from './CalendarHeader';
import { CalendarView } from './CalendarView';
import { CalendarLegend } from './CalendarLegend';
import { CreateEventModal } from './CreateEventModal';

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

  const handleCreateModalOpen = () => {
    setShowCreateModal(true);
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setSelectedRange(null);
    setSelectedDate(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Calendar Header */}
      <CalendarHeader
        currentView={currentView}
        onViewChange={handleViewChange}
        onCreateEvent={handleCreateModalOpen}
      />

      {/* Calendar View */}
      <CalendarView
        currentView={currentView}
        events={events}
        onDateClick={handleDateClick}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={handleCreateModalClose}
        onSubmit={handleCreateEvent}
        users={users}
        selectedRange={selectedRange}
        selectedDate={selectedDate}
      />

      {/* Calendar Legend */}
      <CalendarLegend />
    </div>
  );
};
