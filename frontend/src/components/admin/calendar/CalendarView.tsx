import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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

interface CalendarViewProps {
  currentView: 'timeGridWeek' | 'timeGridDay';
  events: any[];
  onDateClick: (arg: DateClickInfo) => void;
  onDateSelect: (selectInfo: SelectInfo) => void;
  onEventClick: (clickInfo: EventInfo) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentView,
  events,
  onDateClick,
  onDateSelect,
  onEventClick,
}) => {
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(currentView);
    }
  }, [currentView]);

  return (
    <>
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
          dateClick={onDateClick}
          select={onDateSelect}
          eventClick={onEventClick}
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
    </>
  );
};
