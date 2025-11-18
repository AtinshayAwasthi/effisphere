import React, { useState, useEffect } from 'react';
import { Users, Shield, AlertTriangle, TrendingUp, Clock, MapPin, Activity } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { EmployeeStatusWidget } from './EmployeeStatusWidget';
import { analyticsService, DepartmentStats } from '../lib/analytics';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalHoursToday: 0,
    averageProductivity: 0
  });
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [overallMetrics, deptStats] = await Promise.all([
        analyticsService.getOverallMetrics(),
        analyticsService.getDepartmentStats()
      ]);
      
      setMetrics(overallMetrics);
      setDepartmentStats(deptStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Admin Control Center</h2>
            <p className="text-red-100">Monitor and manage your entire workforce</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold">{new Date().toLocaleTimeString()}</div>
            <div className="text-red-100">System Time</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Employees"
          value={metrics.totalEmployees.toString()}
          icon={Users}
          color="blue"
          trend={loading ? "Loading..." : "Active workforce"}
        />
        
        <MetricCard
          title="Currently Working"
          value={metrics.activeEmployees.toString()}
          icon={Activity}
          color="green"
          trend={loading ? "Loading..." : `${metrics.totalHoursToday}h total today`}
        />
        
        <MetricCard
          title="Avg Productivity"
          value={`${metrics.averageProductivity}%`}
          icon={TrendingUp}
          color="purple"
          trend={loading ? "Loading..." : "Based on 8h target"}
        />
        
        <MetricCard
          title="Hours Today"
          value={`${metrics.totalHoursToday}h`}
          icon={Clock}
          color="blue"
          trend={loading ? "Loading..." : "Total work hours"}
        />
      </div>

      {/* Real-time Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Employee Status */}
        <EmployeeStatusWidget />

        {/* Security Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Alerts</h3>
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <p>No security alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : departmentStats.length > 0 ? (
              departmentStats.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{dept.department}</p>
                    <p className="text-sm text-gray-600">{dept.employeeCount} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{dept.totalHours}h</p>
                    <p className="text-sm text-gray-600">{dept.averageHours}h avg</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No department data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Admin Actions</h3>
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              <p>No recent actions</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">View All Alerts</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Manage Employees</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Generate Report</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Security Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}