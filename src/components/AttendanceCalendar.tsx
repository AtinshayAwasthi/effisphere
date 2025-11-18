import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';

export function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const attendanceData: { [key: string]: { status: 'present' | 'absent' | 'late'; hours: string; checkIn?: string; checkOut?: string } } = {
    '2024-12-01': { status: 'present', hours: '8.5h', checkIn: '09:00 AM', checkOut: '05:30 PM' },
    '2024-12-02': { status: 'present', hours: '8.2h', checkIn: '09:15 AM', checkOut: '05:30 PM' },
    '2024-12-03': { status: 'late', hours: '7.8h', checkIn: '09:45 AM', checkOut: '05:30 PM' },
    '2024-12-04': { status: 'present', hours: '8.0h', checkIn: '09:00 AM', checkOut: '05:00 PM' },
    '2024-12-05': { status: 'present', hours: '8.3h', checkIn: '08:55 AM', checkOut: '05:15 PM' },
    '2024-12-06': { status: 'absent', hours: '0h' },
    '2024-12-07': { status: 'absent', hours: '0h' },
    '2024-12-08': { status: 'present', hours: '8.1h', checkIn: '09:10 AM', checkOut: '05:20 PM' },
    '2024-12-09': { status: 'present', hours: '8.4h', checkIn: '09:00 AM', checkOut: '05:25 PM' },
    '2024-12-10': { status: 'late', hours: '7.9h', checkIn: '09:30 AM', checkOut: '05:30 PM' },
    '2024-12-11': { status: 'present', hours: '8.2h', checkIn: '08:58 AM', checkOut: '05:12 PM' },
    '2024-12-12': { status: 'present', hours: '8.5h', checkIn: '09:00 AM', checkOut: '05:30 PM' },
    '2024-12-13': { status: 'absent', hours: '0h' },
    '2024-12-14': { status: 'absent', hours: '0h' },
    '2024-12-15': { status: 'present', hours: '8.0h', checkIn: '09:05 AM', checkOut: '05:05 PM' },
    '2024-12-16': { status: 'present', hours: '8.3h', checkIn: '09:00 AM', checkOut: '05:20 PM' },
    '2024-12-17': { status: 'present', hours: '8.1h', checkIn: '09:15 AM', checkOut: '05:20 PM' },
    '2024-12-18': { status: 'late', hours: '7.7h', checkIn: '09:50 AM', checkOut: '05:30 PM' },
    '2024-12-19': { status: 'present', hours: '8.4h', checkIn: '08:55 AM', checkOut: '05:25 PM' },
    '2024-12-20': { status: 'present', hours: '8.2h', checkIn: '09:00 AM', checkOut: '05:15 PM' },
    '2024-12-21': { status: 'present', hours: '6.5h', checkIn: '09:00 AM', checkOut: '03:30 PM' },
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDateKey = (day: number) => {
    return `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const getAttendanceStats = () => {
    const totalDays = Object.keys(attendanceData).length;
    const presentDays = Object.values(attendanceData).filter(data => data.status === 'present').length;
    const lateDays = Object.values(attendanceData).filter(data => data.status === 'late').length;
    const absentDays = Object.values(attendanceData).filter(data => data.status === 'absent').length;
    
    return {
      attendance: Math.round((presentDays / totalDays) * 100),
      present: presentDays,
      late: lateDays,
      absent: absentDays,
      total: totalDays
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Attendance Calendar</h2>
          <p className="text-gray-600 mt-1">Track your daily attendance and work hours</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Attendance Rate</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.attendance}%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Present Days</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.present}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Late Days</h3>
          </div>
          <div className="text-3xl font-bold text-yellow-600">{stats.late}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Absent Days</h3>
          </div>
          <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: firstDayOfMonth }, (_, index) => (
            <div key={`empty-${index}`} className="h-12"></div>
          ))}
          
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const dateKey = getDateKey(day);
            const attendance = attendanceData[dateKey];
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === currentDate.getMonth() &&
                           new Date().getFullYear() === currentDate.getFullYear();

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`h-12 w-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-105 ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                } ${
                  attendance?.status === 'present' ? 'bg-green-100 text-green-700 border-2 border-green-200' :
                  attendance?.status === 'late' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-200' :
                  attendance?.status === 'absent' ? 'bg-red-100 text-red-700 border-2 border-red-200' :
                  'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Legend</h4>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded"></div>
            <span className="text-sm text-gray-700">Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-200 rounded"></div>
            <span className="text-sm text-gray-700">Late</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded"></div>
            <span className="text-sm text-gray-700">Absent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 border rounded"></div>
            <span className="text-sm text-gray-700">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
}