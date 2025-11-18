import React, { useState } from 'react';
import { Shield, AlertTriangle, Eye, MapPin, Clock, Smartphone, Camera, Fingerprint, Wifi, Activity } from 'lucide-react';

export function FraudDetection() {
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
  const [activeMonitoring, setActiveMonitoring] = useState(true);

  const fraudAlerts = [];

  const realTimeMetrics = {
    activeEmployees: 0,
    biometricVerifications: 0,
    locationChecks: 0,
    fraudAttempts: 0,
    preventionRate: 0,
    averageResponseTime: 0
  };

  const antiSpoofingMeasures = [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-600';
      case 'investigating':
        return 'bg-orange-500';
      case 'flagged':
        return 'bg-red-500';
      case 'monitoring':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      red: 'text-red-600 bg-red-50',
      indigo: 'text-indigo-600 bg-indigo-50'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced Fraud Detection</h2>
          <p className="text-gray-600 mt-1">AI-powered security monitoring with real-time threat detection</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${activeMonitoring ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {activeMonitoring ? 'Active Monitoring' : 'Monitoring Disabled'}
            </span>
          </div>
          <button
            onClick={() => setActiveMonitoring(!activeMonitoring)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeMonitoring 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {activeMonitoring ? 'Disable Monitoring' : 'Enable Monitoring'}
          </button>
        </div>
      </div>

      {/* Real-time Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1 bg-blue-50 rounded">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Active Users</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.activeEmployees}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1 bg-green-50 rounded">
              <Fingerprint className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Biometric Checks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.biometricVerifications}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1 bg-purple-50 rounded">
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Location Verifications</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.locationChecks}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1 bg-red-50 rounded">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Fraud Attempts</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{realTimeMetrics.fraudAttempts}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1 bg-green-50 rounded">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Prevention Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{realTimeMetrics.preventionRate}%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1 bg-yellow-50 rounded">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Response Time</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{realTimeMetrics.averageResponseTime}s</div>
        </div>
      </div>

      {/* Active Fraud Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Active Security Alerts</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-600 font-medium">{fraudAlerts.length} Critical Alerts</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {fraudAlerts.map((alert) => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-4">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(alert.status)} mt-1`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{alert.type}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity} risk
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Risk Score:</span>
                        <span className={`text-xs font-bold ${
                          alert.riskScore >= 90 ? 'text-red-600' : 
                          alert.riskScore >= 70 ? 'text-orange-600' : 'text-yellow-600'
                        }`}>
                          {alert.riskScore}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>{alert.employee}</strong> - {alert.description}
                    </p>
                    <p className="text-xs text-gray-500">{alert.timestamp}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  {selectedAlert === alert.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {selectedAlert === alert.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Evidence Collected</h5>
                      <ul className="space-y-2">
                        {alert.evidence.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Recommended Actions</h5>
                      <ul className="space-y-2">
                        {alert.recommendations.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                      Take Immediate Action
                    </button>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                      Escalate to Security
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Contact Employee
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Anti-Fraud Security Measures */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Security Measures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {antiSpoofingMeasures.map((measure, index) => {
            const IconComponent = measure.icon;
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getIconColor(measure.color)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium text-green-600">{measure.status}</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{measure.effectiveness}</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{measure.title}</h4>
                <p className="text-sm text-gray-600">{measure.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fraud Prevention Solutions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Comprehensive Fraud Prevention Solutions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-red-600" />
                <span>Phone Left at Office Detection</span>
              </h4>
              <p className="text-sm text-gray-600 mb-3">Employee leaves phone at office but is actually absent</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Random biometric verification requests every 30-60 minutes</li>
                <li>• Real-time photo capture with 3D liveness detection</li>
                <li>• Accelerometer monitoring for device movement patterns</li>
                <li>• Behavioral analysis of typing patterns and app usage</li>
                <li>• Continuous camera access monitoring</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <Eye className="w-5 h-5 text-orange-600" />
                <span>Device Sharing Prevention</span>
              </h4>
              <p className="text-sm text-gray-600 mb-3">Someone else using employee's device to clock in</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Continuous facial recognition with confidence scoring</li>
                <li>• Multi-factor biometric authentication (face + fingerprint + voice)</li>
                <li>• Keystroke dynamics and typing behavior analysis</li>
                <li>• Voice pattern verification during calls/meetings</li>
                <li>• Device interaction pattern monitoring</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-yellow-600" />
                <span>Location Spoofing Detection</span>
              </h4>
              <p className="text-sm text-gray-600 mb-3">Fake GPS location while working remotely</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Multi-source location verification (GPS, WiFi, cell towers)</li>
                <li>• IP geolocation cross-referencing</li>
                <li>• Bluetooth beacon detection for office presence</li>
                <li>• Network analysis and company WiFi validation</li>
                <li>• Environmental context verification</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Identity Fraud Prevention</span>
              </h4>
              <p className="text-sm text-gray-600 mb-3">Someone impersonating the employee</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Advanced 3D facial recognition with anti-spoofing</li>
                <li>• Liveness detection preventing photo/video attacks</li>
                <li>• Voice biometric verification with pattern analysis</li>
                <li>• Behavioral biometric profiling</li>
                <li>• Multi-modal authentication requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* System Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Performance & Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">99.2%</div>
            <p className="text-sm text-gray-600">Fraud Prevention Rate</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.2%' }} />
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1.2s</div>
            <p className="text-sm text-gray-600">Average Detection Time</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">98.7%</div>
            <p className="text-sm text-gray-600">Biometric Accuracy</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98.7%' }} />
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">24/7</div>
            <p className="text-sm text-gray-600">Continuous Monitoring</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}