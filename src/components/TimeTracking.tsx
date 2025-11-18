import React, { useState } from 'react';
import { Play, Pause, Square, MapPin, Clock } from 'lucide-react';
import { useEmployeeStore } from '../store/employeeStore';

export function TimeTracking() {
  const { 
    isWorking, 
    workStart, 
    totalHours, 
    startWork, 
    endWork, 
    pauseWork, 
    resumeWork 
  } = useEmployeeStore();
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('Unknown Location');

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationName('Main Office - Downtown'); // Mock location name
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationName('Location Access Denied');
        }
      );
    }
  }, []);

  const handleStartWork = () => {
    if (location) {
      startWork(location);
    } else {
      alert('Please enable location access to start work');
    }
  };

  const getCurrentSession = () => {
    if (!isWorking || !workStart) return '00:00:00';
    const now = new Date();
    const diff = now.getTime() - workStart.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [currentSession, setCurrentSession] = useState(getCurrentSession());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSession(getCurrentSession());
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorking, workStart]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Time Tracking</h2>
          <p className="text-gray-600 mt-1">Monitor your work hours and productivity</p>
        </div>
      </div>

      {/* Main Timer Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
            {currentSession}
          </div>
          <p className="text-lg text-gray-600">Current Session</p>
        </div>

        <div className="flex items-center justify-center space-x-4 mb-8">
          {!isWorking ? (
            <button
              onClick={handleStartWork}
              disabled={!location}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-medium transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Start Work</span>
            </button>
          ) : (
            <>
              <button
                onClick={pauseWork}
                className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
              <button
                onClick={endWork}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Square className="w-5 h-5" />
                <span>Stop Work</span>
              </button>
            </>
          )}
        </div>

        {/* Location Info */}
        <div className={`flex items-center justify-center space-x-2 mb-6 ${
          location ? 'text-green-600' : 'text-red-600'
        }`}>
          <MapPin className="w-4 h-4" />
          <span>{location ? locationName : 'Location access required'}</span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isWorking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className={`text-sm font-medium ${
            isWorking ? 'text-green-600' : 'text-gray-600'
          }`}>
            {isWorking ? 'Currently Working' : 'Not Working'}
          </span>
        </div>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Today's Total</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalHours}</div>
          <p className="text-sm text-gray-600 mt-1">Hours worked today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">32.5h</div>
          <p className="text-sm text-gray-600 mt-1">Hours worked this week</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Average</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">8.2h</div>
          <p className="text-sm text-gray-600 mt-1">Daily average</p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
        <div className="space-y-4">
          {[
            { date: 'Today', start: '09:00 AM', end: '12:30 PM', duration: '3h 30m', status: 'completed' },
            { date: 'Today', start: '01:30 PM', end: 'In Progress', duration: currentSession, status: 'active' },
            { date: 'Yesterday', start: '09:15 AM', end: '06:00 PM', duration: '8h 45m', status: 'completed' },
            { date: 'Dec 20', start: '08:30 AM', end: '05:30 PM', duration: '9h 0m', status: 'completed' },
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  session.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.date}</p>
                  <p className="text-xs text-gray-500">{session.start} - {session.end}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.duration}</p>
                <p className={`text-xs ${
                  session.status === 'active' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {session.status === 'active' ? 'Active' : 'Completed'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}