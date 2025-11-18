import React from 'react';
import { Calendar } from 'lucide-react';

export function AttendanceChart() {
  const weeklyData = [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Absent</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center py-8 text-gray-500">
          <p>No attendance data available</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Average Attendance</span>
          <span className="font-semibold text-green-600">0%</span>
        </div>
      </div>
    </div>
  );
}