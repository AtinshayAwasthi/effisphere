import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AttendanceRecord {
  id: string;
  employee_name: string;
  department: string;
  check_in_time: string;
  check_out_time?: string;
  total_hours?: number;
  status: string;
}

export function AttendanceReport() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
    loadAttendanceRecords();
  }, [dateFilter, departmentFilter]);

  const loadDepartments = async () => {
    try {
      const { data } = await supabase
        .from('employees')
        .select('department')
        .not('department', 'is', null);
      
      const uniqueDepts = [...new Set(data?.map(e => e.department))];
      setDepartments(uniqueDepts);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      const startDate = new Date(dateFilter);
      const endDate = new Date(dateFilter);
      endDate.setDate(endDate.getDate() + 1);

      let query = supabase
        .from('attendance_records')
        .select(`
          id,
          check_in_time,
          check_out_time,
          total_hours,
          status,
          employees!inner(
            full_name,
            department
          )
        `)
        .gte('check_in_time', startDate.toISOString())
        .lt('check_in_time', endDate.toISOString())
        .order('check_in_time', { ascending: false });

      if (departmentFilter !== 'all') {
        query = query.eq('employees.department', departmentFilter);
      }

      const { data } = await query;

      const formattedRecords = data?.map(record => ({
        id: record.id,
        employee_name: (record.employees as any).full_name,
        department: (record.employees as any).department,
        check_in_time: record.check_in_time,
        check_out_time: record.check_out_time,
        total_hours: record.total_hours,
        status: record.status
      })) || [];

      setRecords(formattedRecords);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Employee', 'Department', 'Check In', 'Check Out', 'Hours', 'Status'];
    const csvData = records.map(record => [
      record.employee_name,
      record.department,
      new Date(record.check_in_time).toLocaleString(),
      record.check_out_time ? new Date(record.check_out_time).toLocaleString() : 'Not checked out',
      record.total_hours?.toString() || '0',
      record.status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${dateFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Attendance Report</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Check In</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Check Out</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{record.employee_name}</td>
                    <td className="py-3 px-4 text-gray-600">{record.department}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(record.check_in_time).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {record.check_out_time 
                        ? new Date(record.check_out_time).toLocaleTimeString()
                        : 'Not checked out'
                      }
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {record.total_hours ? `${record.total_hours}h` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'completed' ? 'bg-green-100 text-green-800' :
                        record.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No attendance records found for selected date and filters
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