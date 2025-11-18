import React, { useState } from 'react';
import { TrendingUp, Clock, Target, Award, BarChart3, Users, Calendar, Activity } from 'lucide-react';
import { MetricCard } from './MetricCard';

export function ProductivityDashboard() {
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [timeRange, setTimeRange] = useState('month');

  const employees: any[] = [];
  const productivityData: any[] = [];
  const departmentStats: any[] = [];

  const getSelectedEmployeeData = () => {
    if (selectedEmployee === 'all') {
      return {
        totalHours: productivityData.reduce((sum, emp) => sum + emp.metrics.totalHours, 0),
        activeTime: productivityData.reduce((sum, emp) => sum + emp.metrics.activeTime, 0),
        tasksCompleted: productivityData.reduce((sum, emp) => sum + emp.metrics.tasksCompleted, 0),
        tasksAssigned: productivityData.reduce((sum, emp) => sum + emp.metrics.tasksAssigned, 0),
        avgProductivity: productivityData.reduce((sum, emp) => sum + emp.metrics.productivityScore, 0) / productivityData.length,
        avgPunctuality: productivityData.reduce((sum, emp) => sum + emp.metrics.punctualityScore, 0) / productivityData.length
      };
    }
    
    const employee = productivityData.find(emp => emp.employeeId === parseInt(selectedEmployee));
    return employee ? {
      totalHours: employee.metrics.totalHours,
      activeTime: employee.metrics.activeTime,
      tasksCompleted: employee.metrics.tasksCompleted,
      tasksAssigned: employee.metrics.tasksAssigned,
      avgProductivity: employee.metrics.productivityScore,
      avgPunctuality: employee.metrics.punctualityScore
    } : null;
  };

  const selectedData = getSelectedEmployeeData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Productivity Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive productivity analytics and performance insights</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id.toString()}>
                {emp.name} - {emp.department}
              </option>
            ))}
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Working Hours"
          value="0h"
          icon={Clock}
          color="blue"
          trend="No data"
        />
        
        <MetricCard
          title="Active Time"
          value="0h"
          icon={Activity}
          color="green"
          trend="No data"
        />
        
        <MetricCard
          title="Tasks Completed"
          value="0/0"
          icon={Target}
          color="purple"
          trend="No data"
        />
        
        <MetricCard
          title="Productivity Score"
          value="0%"
          icon={TrendingUp}
          color="yellow"
          trend="No data"
        />
      </div>

      {/* Productivity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Individual Performance</h3>
            </div>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <p>No productivity data available</p>
          </div>
        </div>

        {/* Time Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Time Distribution</h3>
            </div>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <p>No time distribution data available</p>
          </div>
        </div>
      </div>

      {/* Department Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Employees</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Productivity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Hours</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Completion Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No department performance data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <p>No performance data available</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}