import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, Clock, Send, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  department: string;
  status: string;
}

interface VerificationSession {
  id: string;
  employee_id: string;
  triggered_at: string;
  expires_at: string;
  status: string;
  face_match_score: number;
  response_time_seconds: number;
}

export function AdminVerificationTrigger() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [timeoutMinutes, setTimeoutMinutes] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const { data: empData } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')
      .order('full_name');

    if (empData) setEmployees(empData);
    await loadSessions();
  };

  const loadSessions = async () => {
    try {
      const { data } = await supabase
        .from('verification_sessions')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(50);
      
      if (data) setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    }
  };

  const triggerVerification = async (employeeId?: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const targetEmployees = employeeId ? [employeeId] : employees.map(e => e.id);
      const expiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);
      
      // Create verification sessions in database
      const sessions = targetEmployees.map(empId => ({
        employee_id: empId,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      }));
      
      const { error } = await supabase
        .from('verification_sessions')
        .insert(sessions);
      
      if (error) throw error;
      
      setResult({
        success: true,
        message: `Verification triggered for ${targetEmployees.length} employee(s). Timeout set to ${timeoutMinutes} minutes.`,
      });
      
      await loadSessions();
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        message: 'Failed to trigger verification',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkExpired = async () => {
    try {
      // Update expired sessions
      await supabase
        .from('verification_sessions')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString());
      
      await loadSessions();
    } catch (error) {
      console.error('Error checking expired:', error);
    }
  };

  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const verifiedSessions = sessions.filter(s => s.status === 'verified');
  const failedSessions = sessions.filter(s => s.status === 'failed' || s.status === 'expired');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Random Verification Control</h2>
          <p className="text-gray-600 mt-1">Trigger and monitor random presence checks</p>
        </div>
        <button
          onClick={checkExpired}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Check Expired Sessions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Pending</p>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-4xl font-bold text-amber-600">{pendingSessions.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Verified</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-4xl font-bold text-green-600">{verifiedSessions.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Failed/Expired</p>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-4xl font-bold text-red-600">{failedSessions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trigger Verification</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee (or trigger for all)
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Active Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={timeoutMinutes}
              onChange={(e) => setTimeoutMinutes(parseInt(e.target.value) || 5)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={() => triggerVerification(selectedEmployee || undefined)}
          disabled={isLoading}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center space-x-2">
            <Send className="w-5 h-5" />
            <span>
              {isLoading
                ? 'Triggering...'
                : selectedEmployee
                ? 'Trigger for Selected Employee'
                : 'Trigger for All Active Employees'}
            </span>
          </span>
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={result.success ? 'text-green-800 font-medium' : 'text-red-800 font-medium'}>
                {result.message}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Verification Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Triggered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No verification sessions found
                  </td>
                </tr>
              ) : (
                sessions.slice(0, 20).map(session => {
                  const employee = employees.find(e => e.id === session.employee_id);
                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee?.full_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(session.triggered_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(session.expires_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          session.status === 'verified' ? 'bg-green-100 text-green-700' :
                          session.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          session.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {session.face_match_score > 0 ? (
                          <span className={`font-semibold ${
                            session.face_match_score >= 90 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {session.face_match_score.toFixed(1)}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {session.response_time_seconds > 0
                          ? `${Math.floor(session.response_time_seconds / 60)}m ${session.response_time_seconds % 60}s`
                          : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
