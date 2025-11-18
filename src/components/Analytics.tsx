import React, { useState } from 'react';
import { TrendingUp, Clock, Target, Calendar, BarChart3, PieChart } from 'lucide-react';
import { MetricCard } from './MetricCard';

export function Analytics() {
  const [timeRange, setTimeRange] = useState('week');

  const timeRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600 mt-1">Detailed insights into productivity and attendance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Productivity Score"
          value="92%"
          icon={TrendingUp}
          color="green"
          trend="+5.2%"
        />
        
        <MetricCard
          title="Average Hours/Day"
          value="8.2h"
          icon={Clock}
          color="blue"
          trend="+0.3h"
        />
        
        <MetricCard
          title="Attendance Rate"
          value="96%"
          icon={Target}
          color="purple"
          trend="+2.1%"
        />
        
        <MetricCard
          title="On-time Rate"
          value="88%"
          icon={Calendar}
          color="yellow"
          trend="+1.5%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Productivity</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <p>No productivity data available</p>
            </div>
          </div>
        </div>

        {/* Time Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Time Distribution</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <p>No time distribution data available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h3>
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <p>No monthly data available</p>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals Progress</h3>
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <p>No goals data available</p>
            </div>
          </div>
        </div>

        {/* Recent Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <p>No insights available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}