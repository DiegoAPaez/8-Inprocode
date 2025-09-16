import {AdminCalendar} from "./AdminCalendar.tsx";

export const ManageSchedule: React.FC = () => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Management</h2>
            </div>

            {/* Placeholder content - will be implemented when backend data endpoints are ready */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Schedule Management</h3>
                <p className="text-gray-600 mb-4">
                    This section will allow you to manage employee schedules, shifts, and availability.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-semibold text-gray-800 mb-2">View Schedules</h4>
                        <p className="text-sm text-gray-600">See employee shifts and availability</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-semibold text-gray-800 mb-2">Manage Shifts</h4>
                        <p className="text-sm text-gray-600">Add, edit, or remove employee shifts</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-semibold text-gray-800 mb-2">Notifications</h4>
                        <p className="text-sm text-gray-600">Notify employees of schedule changes</p>
                    </div>
                </div>
            </div>

            <AdminCalendar/>
        </div>
    );
}