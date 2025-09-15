import React from 'react';

interface LegendItem {
  color: string;
  label: string;
}

interface CalendarLegendProps {
  legendItems?: LegendItem[];
}

const defaultLegendItems: LegendItem[] = [
  { color: 'bg-blue-500', label: 'Morning Shift' },
  { color: 'bg-green-500', label: 'Evening Shift' },
  { color: 'bg-amber-500', label: 'Kitchen Staff' },
];

export const CalendarLegend: React.FC<CalendarLegendProps> = ({
  legendItems = defaultLegendItems,
}) => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Shift Types</h3>
      <div className="flex flex-wrap gap-4">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-4 h-4 ${item.color} rounded`}></div>
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
