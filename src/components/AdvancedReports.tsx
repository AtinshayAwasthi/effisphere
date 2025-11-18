import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReportData {
  date: string;
  totalHours: number;
  employeeCount: number;
  avgHours: number;
  onTimeCount: number;
  lateCount: number;
}

export function AdvancedReports() {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('daily');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReport();
  }, [startDate, endDate, reportType]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('attendance_records')
        .select(`
          check_in_time,
          total_hours,
          employee_id,
          employees!inner(full_name, department)
        `)
        .gte('check_in_time', startDate)
        .lte('check_in_time', endDate + 'T23:59:59')
        .eq('status', 'completed');

      // Group data by date
      const groupedData = new Map<string, {
        totalHours: number;
        employees: Set<string>;
        onTime: number;
        late: number;
      }>();

      data?.forEach(record => {
        const date = new Date(record.check_in_time).toISOString().split('T')[0];
        const checkInHour = new Date(record.check_in_time).getHours();
        
        const existing = groupedData.get(date) || {
          totalHours: 0,
          employees: new Set(),
          onTime: 0,
          late: 0
        };

        existing.totalHours += record.total_hours || 0;
        existing.employees.add(record.employee_id);
        
        if (checkInHour <= 9) {
          existing.onTime++;
        } else {
          existing.late++;
        }

        groupedData.set(date, existing);
      });

      const reportData: ReportData[] = Array.from(groupedData.entries()).map(([date, data]) => ({
        date,
        totalHours: Math.round(data.totalHours * 100) / 100,
        employeeCount: data.employees.size,
        avgHours: Math.round((data.totalHours / data.employees.size) * 100) / 100 || 0,
        onTimeCount: data.onTime,
        lateCount: data.late
      })).sort((a, b) => a.date.localeCompare(b.date));

      setReportData(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const headers = ['Date', 'Total Hours', 'Employees', 'Avg Hours', 'On Time', 'Late'];
    const csvData = reportData.map(row => [
      row.date,
      row.totalHours,
      row.employeeCount,
      row.avgHours,
      row.onTimeCount,
      row.lateCount
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalStats = reportData.reduce(
    (acc, day) => ({
      totalHours: acc.totalHours + day.totalHours,
      totalEmployees: Math.max(acc.totalEmployees, day.employeeCount),
      totalOnTime: acc.totalOnTime + day.onTimeCount,
      totalLate: acc.totalLate + day.lateCount
    }),
    { totalHours: 0, totalEmployees: 0, totalOnTime: 0, totalLate: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Reports</h2>
        <button
          onClick={exportReport}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalHours.toFixed(0)}h</p>
              <p className="text-sm text-gray-600">Total Hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalEmployees}</p>
              <p className="text-sm text-gray-600">Active Employees</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalOnTime}</p>
              <p className="text-sm text-gray-600">On Time Check-ins</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.totalOnTime + totalStats.totalLate > 0 
                  ? Math.round((totalStats.totalOnTime / (totalStats.totalOnTime + totalStats.totalLate)) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-600">Punctuality Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Report</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Total Hours</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Employees</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Avg Hours</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">On Time</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Late</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Punctuality</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-6 text-gray-900">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6 text-gray-600">{row.totalHours}h</td>
                    <td className="py-3 px-6 text-gray-600">{row.employeeCount}</td>
                    <td className="py-3 px-6 text-gray-600">{row.avgHours}h</td>
                    <td className="py-3 px-6 text-green-600">{row.onTimeCount}</td>
                    <td className="py-3 px-6 text-red-600">{row.lateCount}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (row.onTimeCount / (row.onTimeCount + row.lateCount)) > 0.8
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {row.onTimeCount + row.lateCount > 0
                          ? Math.round((row.onTimeCount / (row.onTimeCount + row.lateCount)) * 100)
                          : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
                {reportData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No data available for selected date range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}