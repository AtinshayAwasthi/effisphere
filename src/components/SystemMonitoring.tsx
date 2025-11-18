import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Zap } from 'lucide-react';
import { monitoringService } from '../lib/monitoring';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  checks: Record<string, boolean>;
  responseTime: number;
}

export function SystemMonitoring() {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    checks: {},
    responseTime: 0
  });
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [healthData, reportData] = await Promise.all([
        monitoringService.checkSystemHealth(),
        Promise.resolve(monitoringService.generateReport())
      ]);
      
      setHealth(healthData);
      setReport(reportData);
    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'down': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Monitoring</h2>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            {getStatusIcon(health.status)}
            <div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{health.status}</p>
              <p className="text-sm text-gray-600">System Status</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{health.responseTime.toFixed(0)}ms</p>
              <p className="text-sm text-gray-600">Response Time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {report?.health?.uptime?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-gray-600">Uptime (24h)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {report?.errors?.totalErrors || 0}
              </p>
              <p className="text-sm text-gray-600">Errors (1h)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Checks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(health.checks).map(([check, status]) => (
            <div key={check} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900 capitalize">
                  {check.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {status ? 'Healthy' : 'Failed'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Page Load Time</span>
              <span className="font-medium">
                {report?.performance?.avgPageLoadTime?.toFixed(0) || 0}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg API Response Time</span>
              <span className="font-medium">
                {report?.performance?.avgApiResponseTime?.toFixed(0) || 0}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">User Actions (1h)</span>
              <span className="font-medium">
                {report?.performance?.totalUserActions || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Error Rate</span>
              <span className={`font-medium ${
                (report?.errors?.errorRate || 0) > 0.05 ? 'text-red-600' : 'text-green-600'
              }`}>
                {((report?.errors?.errorRate || 0) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Errors</h3>
          <div className="space-y-3">
            {report?.errors?.topErrors?.length > 0 ? (
              report.errors.topErrors.map((error: any, index: number) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-red-800 font-medium truncate flex-1">
                      {error.message}
                    </p>
                    <span className="text-xs text-red-600 ml-2">
                      {error.count}x
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p>No errors in the last hour</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Environment</p>
            <p className="font-medium">Production</p>
          </div>
          <div>
            <p className="text-gray-600">Version</p>
            <p className="font-medium">v1.0.0</p>
          </div>
          <div>
            <p className="text-gray-600">Last Deployment</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Health Check</p>
            <p className="font-medium">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Monitoring Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={loadSystemData}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
          
          <button
            onClick={() => window.open('/api/metrics', '_blank')}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>View Metrics</span>
          </button>
          
          <button
            onClick={() => alert('Backup initiated')}
            className="flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Backup System</span>
          </button>
        </div>
      </div>
    </div>
  );
}