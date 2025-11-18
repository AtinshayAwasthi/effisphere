import React, { useState } from 'react';
import { TrendingUp, Users, AlertTriangle, Shield, BarChart3, PieChart, Activity } from 'lucide-react';
import { MetricCard } from './MetricCard';

export function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('productivity');

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
          <h2 className="text-3xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive workforce insights and fraud detection metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
          title="Workforce Productivity"
          value="94.2%"
          icon={TrendingUp}
          color="green"
          trend="+3.1%"
        />
        
        <MetricCard
          title="Security Score"
          value="98.7%"
          icon={Shield}
          color="blue"
          trend="+0.5%"
        />
        
        <MetricCard
          title="Fraud Prevention"
          value="99.1%"
          icon={AlertTriangle}
          color="red"
          trend="+1.2%"
        />
        
        <MetricCard
          title="Active Employees"
          value="247"
          icon={Users}
          color="purple"
          trend="+12"
        />
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Detection Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fraud Detection Trends</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { type: 'Location Spoofing', detected: 15, prevented: 14, rate: 93.3 },
              { type: 'Device Sharing', detected: 8, prevented: 8, rate: 100 },
              { type: 'Identity Fraud', detected: 3, prevented: 3, rate: 100 },
              { type: 'Time Manipulation', detected: 12, prevented: 11, rate: 91.7 },
              { type: 'Behavioral Anomaly', detected: 22, prevented: 20, rate: 90.9 }
            ].map((fraud) => (
              <div key={fraud.type} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{fraud.type}</p>
                  <p className="text-xs text-gray-500">{fraud.detected} detected, {fraud.prevented} prevented</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{fraud.rate}%</p>
                  <p className="text-xs text-gray-500">prevention rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { dept: 'Development', productivity: 96, attendance: 94, security: 98 },
              { dept: 'Marketing', productivity: 92, attendance: 89, security: 95 },
              { dept: 'Sales', productivity: 94, attendance: 91, security: 97 },
              { dept: 'HR', productivity: 89, attendance: 96, security: 99 },
              { dept: 'Finance', productivity: 97, attendance: 98, security: 99 }
            ].map((dept) => (
              <div key={dept.dept} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{dept.dept}</span>
                  <span className="text-sm text-gray-600">{Math.round((dept.productivity + dept.attendance + dept.security) / 3)}%</span>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${dept.productivity}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Productivity</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${dept.attendance}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Attendance</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${dept.security}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Security</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biometric Success Rates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Biometric Success Rates</h3>
          <div className="space-y-4">
            {[
              { method: 'Face Recognition', success: 97.8, attempts: 1247 },
              { method: 'Fingerprint', success: 99.2, attempts: 2156 },
              { method: 'Voice Recognition', success: 94.5, attempts: 892 },
              { method: 'Multi-Factor', success: 99.8, attempts: 567 }
            ].map((method) => (
              <div key={method.method}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{method.method}</span>
                  <span className="text-sm text-gray-600">{method.success}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${method.success}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{method.attempts} attempts</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
          <div className="space-y-4">
            {[
              { level: 'Low Risk', count: 198, percentage: 80.2, color: 'bg-green-500' },
              { level: 'Medium Risk', count: 35, percentage: 14.2, color: 'bg-yellow-500' },
              { level: 'High Risk', count: 11, percentage: 4.5, color: 'bg-red-500' },
              { level: 'Critical Risk', count: 3, percentage: 1.2, color: 'bg-red-700' }
            ].map((risk) => (
              <div key={risk.level} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${risk.color}`} />
                  <span className="text-sm font-medium text-gray-700">{risk.level}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{risk.count}</span>
                  <span className="text-xs text-gray-500 ml-1">({risk.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <div className="space-y-4">
            {[
              { metric: 'Detection Speed', value: '1.2s', status: 'excellent' },
              { metric: 'False Positive Rate', value: '0.8%', status: 'good' },
              { metric: 'System Uptime', value: '99.9%', status: 'excellent' },
              { metric: 'Data Processing', value: '2.1M/day', status: 'good' }
            ].map((metric) => (
              <div key={metric.metric} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{metric.metric}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">{metric.value}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    metric.status === 'excellent' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Workforce Analytics Dashboard</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Time-based Analysis */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Peak Activity Hours</h4>
            <div className="space-y-3">
              {[
                { hour: '09:00 AM', activity: 95, fraud: 2 },
                { hour: '10:00 AM', activity: 98, fraud: 1 },
                { hour: '11:00 AM', activity: 92, fraud: 3 },
                { hour: '02:00 PM', activity: 88, fraud: 4 },
                { hour: '03:00 PM', activity: 85, fraud: 5 },
                { hour: '04:00 PM', activity: 78, fraud: 3 }
              ].map((data) => (
                <div key={data.hour} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{data.hour}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${data.activity}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{data.activity}%</span>
                    </div>
                    <span className="text-xs text-red-600">{data.fraud} alerts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Analysis */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Location Distribution</h4>
            <div className="space-y-3">
              {[
                { location: 'Main Office', employees: 156, security: 99.2 },
                { location: 'Branch Office A', employees: 45, security: 97.8 },
                { location: 'Branch Office B', employees: 32, security: 98.5 },
                { location: 'Remote Work', employees: 14, security: 94.1 }
              ].map((location) => (
                <div key={location.location} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{location.location}</p>
                    <p className="text-xs text-gray-500">{location.employees} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{location.security}%</p>
                    <p className="text-xs text-gray-500">security score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}