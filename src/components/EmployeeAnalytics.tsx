import React, { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, Target } from 'lucide-react';
import { analyticsService, AttendanceStats } from '../lib/analytics';

interface EmployeeAnalyticsProps {
  employeeId: string;
}

export function EmployeeAnalytics({ employeeId }: EmployeeAnalyticsProps) {
  const [stats, setStats] = useState<AttendanceStats>({
    totalHours: 0,
    daysWorked: 0,
    averageHoursPerDay: 0,
    onTimePercentage: 0
  });
  const [weeklyData, setWeeklyData] = useState<{ date: string; hours: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [employeeId]);

  const loadAnalytics = async () => {
    try {
      const [employeeStats, weeklyAttendance] = await Promise.all([
        analyticsService.getEmployeeStats(employeeId),
        analyticsService.getWeeklyAttendance(employeeId)
      ]);
      
      setStats(employeeStats);
      setWeeklyData(weeklyAttendance);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
              <p className="text-sm text-gray-600">Total Hours (30d)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.daysWorked}</p>
              <p className="text-sm text-gray-600">Days Worked</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.averageHoursPerDay}h</p>
              <p className="text-sm text-gray-600">Avg Hours/Day</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.onTimePercentage}%</p>
              <p className="text-sm text-gray-600">On Time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Hours</h3>
        <div className="space-y-3">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((day.hours / 8) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">{day.hours}h</span>
              </div>
            </div>
          ))}
          {weeklyData.length === 0 && (
            <p className="text-center text-gray-500 py-4">No attendance data for the past week</p>
          )}
        </div>
      </div>
    </div>
  );
}