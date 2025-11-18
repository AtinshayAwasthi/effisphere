import React, { useState, useEffect } from 'react';
import { Download, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in_time: string;
  check_out_time: string | null;
  face_verified: boolean;
  face_match_score: number;
  is_suspicious: boolean;
  date: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  department: string;
}

export function AdminReports() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: empData } = await supabase
        .from('employees')
        .select('*');

      if (empData) setEmployees(empData);
      
      // Mock data for demo
      setAttendanceData([]);
      setAnomalies([]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Check In', 'Check Out', 'Face Score', 'Status'];
    const rows = attendanceData.map(record => {
      const employee = employees.find(e => e.id === record.employee_id);
      return [
        record.date,
        employee?.full_name || 'Unknown',
        new Date(record.check_in_time).toLocaleTimeString(),
        record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : 'Not checked out',
        record.face_match_score.toFixed(1) + '%',
        record.is_suspicious ? 'Suspicious' : 'Verified'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = {
    totalRecords: attendanceData.length,
    suspiciousCount: attendanceData.filter(r => r.is_suspicious).length,
    averageScore: attendanceData.reduce((sum, r) => sum + r.face_match_score, 0) / attendanceData.length || 0,
    anomaliesCount: anomalies.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">Generate and export attendance reports</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Total Records</p>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalRecords}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Suspicious</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.suspiciousCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Avg Match Score</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.averageScore.toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Anomalies</p>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats.anomaliesCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.slice(0, 20).map(record => {
                const employee = employees.find(e => e.id === record.employee_id);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee?.full_name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(record.check_in_time).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${record.face_match_score >= 90 ? 'text-green-600' : 'text-red-600'}`}>
                        {record.face_match_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.is_suspicious ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Suspicious</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Verified</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Anomalies</h3>
        <div className="space-y-3">
          {anomalies.slice(0, 10).map(anomaly => {
            const employee = employees.find(e => e.id === anomaly.employee_id);
            return (
              <div key={anomaly.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle className={`w-4 h-4 ${
                        anomaly.severity === 'high' ? 'text-red-600' :
                        anomaly.severity === 'medium' ? 'text-amber-600' : 'text-yellow-600'
                      }`} />
                      <span className="font-medium text-gray-900">{employee?.full_name || 'Unknown'}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        anomaly.severity === 'high' ? 'bg-red-100 text-red-700' :
                        anomaly.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{anomaly.severity}</span>
                    </div>
                    <p className="text-sm text-gray-700">{anomaly.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(anomaly.created_at).toLocaleString()} · Type: {anomaly.anomaly_type}
                    </p>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Review</button>
                </div>
              </div>
            );
          })}
          {anomalies.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No unreviewed anomalies</p>
          )}
        </div>
      </div>
    </div>
  );
}
