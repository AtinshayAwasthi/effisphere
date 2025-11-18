import React, { useState } from 'react';
import { Settings, Shield, Bell, MapPin, Clock, Users, Database, Wifi } from 'lucide-react';

export function SystemSettings() {
  const [settings, setSettings] = useState({
    // Security Settings
    biometricVerificationInterval: 30,
    locationVerificationEnabled: true,
    fraudDetectionSensitivity: 'high',
    multiFactorAuthRequired: true,
    
    // Monitoring Settings
    realTimeMonitoring: true,
    behavioralAnalysis: true,
    deviceMovementTracking: true,
    networkAnalysis: true,
    
    // Notification Settings
    fraudAlertNotifications: true,
    attendanceNotifications: true,
    productivityReports: true,
    systemHealthAlerts: true,
    
    // Geofencing Settings
    officeRadius: 100,
    allowRemoteWork: true,
    strictLocationVerification: false,
    
    // Work Schedule Settings
    standardWorkHours: 8,
    flexibleSchedule: true,
    overtimeTracking: true,
    breakTimeTracking: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600 mt-1">Configure security, monitoring, and system preferences</p>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-red-50 rounded-lg">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Security & Fraud Detection</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biometric Verification Interval (minutes)
            </label>
            <input
              type="number"
              value={settings.biometricVerificationInterval}
              onChange={(e) => handleSettingChange('biometricVerificationInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="5"
              max="120"
            />
            <p className="text-xs text-gray-500 mt-1">How often to request biometric verification</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fraud Detection Sensitivity
            </label>
            <select
              value={settings.fraudDetectionSensitivity}
              onChange={(e) => handleSettingChange('fraudDetectionSensitivity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="maximum">Maximum</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Location Verification</label>
              <p className="text-xs text-gray-500">Enable multi-source location verification</p>
            </div>
            <button
              onClick={() => handleSettingChange('locationVerificationEnabled', !settings.locationVerificationEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.locationVerificationEnabled ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.locationVerificationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Multi-Factor Authentication</label>
              <p className="text-xs text-gray-500">Require multiple biometric factors</p>
            </div>
            <button
              onClick={() => handleSettingChange('multiFactorAuthRequired', !settings.multiFactorAuthRequired)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.multiFactorAuthRequired ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.multiFactorAuthRequired ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Monitoring Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Monitoring & Analytics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Real-time Monitoring</label>
              <p className="text-xs text-gray-500">Continuous employee activity monitoring</p>
            </div>
            <button
              onClick={() => handleSettingChange('realTimeMonitoring', !settings.realTimeMonitoring)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.realTimeMonitoring ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.realTimeMonitoring ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Behavioral Analysis</label>
              <p className="text-xs text-gray-500">AI-powered behavior pattern analysis</p>
            </div>
            <button
              onClick={() => handleSettingChange('behavioralAnalysis', !settings.behavioralAnalysis)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.behavioralAnalysis ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.behavioralAnalysis ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Device Movement Tracking</label>
              <p className="text-xs text-gray-500">Monitor device accelerometer data</p>
            </div>
            <button
              onClick={() => handleSettingChange('deviceMovementTracking', !settings.deviceMovementTracking)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.deviceMovementTracking ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.deviceMovementTracking ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Network Analysis</label>
              <p className="text-xs text-gray-500">WiFi and IP-based location verification</p>
            </div>
            <button
              onClick={() => handleSettingChange('networkAnalysis', !settings.networkAnalysis)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.networkAnalysis ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.networkAnalysis ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Geofencing Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Geofencing & Location</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Office Radius (meters)
            </label>
            <input
              type="number"
              value={settings.officeRadius}
              onChange={(e) => handleSettingChange('officeRadius', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="10"
              max="1000"
            />
            <p className="text-xs text-gray-500 mt-1">Acceptable distance from office location</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Allow Remote Work</label>
              <p className="text-xs text-gray-500">Enable work from home capabilities</p>
            </div>
            <button
              onClick={() => handleSettingChange('allowRemoteWork', !settings.allowRemoteWork)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowRemoteWork ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowRemoteWork ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Strict Location Verification</label>
              <p className="text-xs text-gray-500">Require exact location matching</p>
            </div>
            <button
              onClick={() => handleSettingChange('strictLocationVerification', !settings.strictLocationVerification)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.strictLocationVerification ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.strictLocationVerification ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Bell className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Notifications & Alerts</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Fraud Alert Notifications</label>
              <p className="text-xs text-gray-500">Immediate alerts for security threats</p>
            </div>
            <button
              onClick={() => handleSettingChange('fraudAlertNotifications', !settings.fraudAlertNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.fraudAlertNotifications ? 'bg-yellow-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.fraudAlertNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Attendance Notifications</label>
              <p className="text-xs text-gray-500">Daily attendance summaries</p>
            </div>
            <button
              onClick={() => handleSettingChange('attendanceNotifications', !settings.attendanceNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.attendanceNotifications ? 'bg-yellow-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.attendanceNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Productivity Reports</label>
              <p className="text-xs text-gray-500">Weekly productivity insights</p>
            </div>
            <button
              onClick={() => handleSettingChange('productivityReports', !settings.productivityReports)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.productivityReports ? 'bg-yellow-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.productivityReports ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">System Health Alerts</label>
              <p className="text-xs text-gray-500">System performance notifications</p>
            </div>
            <button
              onClick={() => handleSettingChange('systemHealthAlerts', !settings.systemHealthAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.systemHealthAlerts ? 'bg-yellow-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.systemHealthAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Work Schedule Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Work Schedule & Time Tracking</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Standard Work Hours (per day)
            </label>
            <input
              type="number"
              value={settings.standardWorkHours}
              onChange={(e) => handleSettingChange('standardWorkHours', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="4"
              max="12"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Flexible Schedule</label>
              <p className="text-xs text-gray-500">Allow flexible work hours</p>
            </div>
            <button
              onClick={() => handleSettingChange('flexibleSchedule', !settings.flexibleSchedule)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.flexibleSchedule ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.flexibleSchedule ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Overtime Tracking</label>
              <p className="text-xs text-gray-500">Monitor overtime hours</p>
            </div>
            <button
              onClick={() => handleSettingChange('overtimeTracking', !settings.overtimeTracking)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.overtimeTracking ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.overtimeTracking ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Break Time Tracking</label>
              <p className="text-xs text-gray-500">Track break and lunch times</p>
            </div>
            <button
              onClick={() => handleSettingChange('breakTimeTracking', !settings.breakTimeTracking)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.breakTimeTracking ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.breakTimeTracking ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Settings */}
      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Reset to Defaults
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}