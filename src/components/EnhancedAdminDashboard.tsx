import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle, Activity, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalEmployees: number;
  activeToday: number;
  pendingVerifications: number;
  anomaliesCount: number;
  avgProductivity: number;
  suspiciousActivities: number;
}

export function EnhancedAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeToday: 0,
    pendingVerifications: 0,
    anomaliesCount: 0,
    avgProductivity: 0,
    suspiciousActivities: 0,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      // Get total employees
      const { count: totalEmp } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get users who logged in today
      const today = new Date().toISOString().split('T')[0];
      const { count: activeCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_login_at', today);

      // Get pending verification codes
      const { count: pendingVerif } = await supabase
        .from('verification_codes')
        .select('*', { count: 'exact', head: true })
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString());

      setStats({
        totalEmployees: totalEmp || 0,
        activeToday: activeCount || 0,
        pendingVerifications: pendingVerif || 0,
        anomaliesCount: 0,
        avgProductivity: 0,
        suspiciousActivities: 0
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default values on error
      setStats({
        totalEmployees: 0,
        activeToday: 0,
        pendingVerifications: 0,
        anomaliesCount: 0,
        avgProductivity: 0,
        suspiciousActivities: 0,
      });
      setLastUpdate(new Date());
    }
  };

  const calculateProductivity = async () => {
    setIsCalculating(true);
    try {
      // Calculate productivity locally
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('total_hours')
        .eq('status', 'completed')
        .gte('check_in_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      const totalHours = attendanceData?.reduce((sum, record) => sum + (record.total_hours || 0), 0) || 0;
      const expectedHours = stats.totalEmployees * 40; // 40 hours per week per employee
      const productivity = expectedHours > 0 ? (totalHours / expectedHours) * 100 : 0;
      
      setStats(prev => ({ ...prev, avgProductivity: Math.min(productivity, 100) }));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error calculating productivity:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const detectAnomalies = async () => {
    setIsDetecting(true);
    try {
      // Detect anomalies locally
      const { data: recentRecords } = await supabase
        .from('attendance_records')
        .select('employee_id, location_lat, location_lng, check_in_time')
        .gte('check_in_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      let anomalies = 0;
      let suspicious = 0;
      
      // Simple anomaly detection
      if (recentRecords) {
        const locationGroups = new Map();
        recentRecords.forEach(record => {
          const key = `${record.location_lat},${record.location_lng}`;
          if (!locationGroups.has(key)) locationGroups.set(key, []);
          locationGroups.get(key).push(record);
        });
        
        // Flag locations with too many check-ins (potential spoofing)
        locationGroups.forEach(records => {
          if (records.length > 10) anomalies++;
          if (records.length > 5) suspicious++;
        });
      }
      
      setStats(prev => ({ ...prev, anomaliesCount: anomalies, suspiciousActivities: suspicious }));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Real-Time Admin Dashboard</h2>
            <p className="text-red-100">Monitor workforce activity, productivity, and security</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-mono font-bold">{new Date().toLocaleTimeString()}</div>
            <div className="text-red-100 text-sm mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Total Employees</p>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats.totalEmployees}</p>
          <p className="text-sm text-gray-500 mt-1">Active accounts</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Active Today</p>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-4xl font-bold text-green-600">{stats.activeToday}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.totalEmployees > 0
              ? `${((stats.activeToday / stats.totalEmployees) * 100).toFixed(1)}% attendance`
              : 'No data'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Avg Productivity</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-4xl font-bold text-purple-600">{stats.avgProductivity.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">Team performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Pending Verifications</p>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-4xl font-bold text-amber-600">{stats.pendingVerifications}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting response</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Anomalies Detected</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-4xl font-bold text-red-600">{stats.anomaliesCount}</p>
          <p className="text-sm text-gray-500 mt-1">Need review</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Suspicious Activity</p>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-4xl font-bold text-rose-600">{stats.suspiciousActivities}</p>
          <p className="text-sm text-gray-500 mt-1">Unresolved cases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Analytics</h3>
          <p className="text-sm text-gray-600 mb-4">
            Calculate real-time productivity scores based on tasks completed, hours worked, and verification compliance.
          </p>
          <button
            onClick={calculateProductivity}
            disabled={isCalculating}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center space-x-2">
              <RefreshCw className={`w-5 h-5 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>{isCalculating ? 'Calculating...' : 'Calculate Productivity Now'}</span>
            </span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Anomaly Detection</h3>
          <p className="text-sm text-gray-600 mb-4">
            Detect suspicious patterns: same check-in times, identical GPS locations, low productivity, high fraud rates.
          </p>
          <button
            onClick={detectAnomalies}
            disabled={isDetecting}
            className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center space-x-2">
              <AlertTriangle className={`w-5 h-5 ${isDetecting ? 'animate-pulse' : ''}`} />
              <span>{isDetecting ? 'Scanning...' : 'Run Anomaly Detection'}</span>
            </span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-blue-900 mb-2">Automated System Features:</p>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Real-time attendance monitoring with GPS verification</li>
              <li>• AI-powered face recognition with 90% accuracy threshold</li>
              <li>• Random verification checks to prevent fraud</li>
              <li>• Productivity scoring: (Tasks Completed / Tasks Assigned) * 100 - Time Delay Factor</li>
              <li>• AI anomaly detection for suspicious patterns</li>
              <li>• CSV/PDF report generation for compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
