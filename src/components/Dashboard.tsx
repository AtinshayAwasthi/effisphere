import React from 'react';
import { Clock, MapPin, Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AttendanceChart } from './AttendanceChart';
import { ProductivityChart } from './ProductivityChart';
import { LocationStatus } from './LocationStatus';
import { useEmployeeStore } from '../store/employeeStore';

export function Dashboard() {
  const { currentUser, isWorking, workStart } = useEmployeeStore();

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getWorkDuration = () => {
    if (!isWorking || !workStart) return '00:00:00';
    const now = new Date();
    const diff = now.getTime() - workStart.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [currentTime, setCurrentTime] = React.useState(getCurrentTime());
  const [workDuration, setWorkDuration] = React.useState(getWorkDuration());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setWorkDuration(getWorkDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorking, workStart]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {currentUser?.name}!</h2>
            <p className="text-blue-100">Here's your productivity overview for today</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold">{currentTime}</div>
            <div className="text-blue-100">Current Time</div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Work Status"
          value={isWorking ? "Working" : "Not Working"}
          icon={Clock}
          color={isWorking ? "green" : "gray"}
          trend="+5%"
        />
        
        <MetricCard
          title="Today's Hours"
          value={workDuration}
          icon={TrendingUp}
          color="blue"
          trend="+12%"
        />
        
        <MetricCard
          title="Location"
          value="Unknown"
          icon={MapPin}
          color="gray"
          trend="Not verified"
        />
        
        <MetricCard
          title="Productivity"
          value="0%"
          icon={CheckCircle}
          color="gray"
          trend="No data"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <ProductivityChart />
      </div>

      {/* Recent Activity & Location Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
            </div>
          </div>
        </div>

        <LocationStatus />
      </div>
    </div>
  );
}