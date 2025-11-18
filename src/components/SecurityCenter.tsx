import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Monitor, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { securityService } from '../lib/security';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  created_at: string;
  resolved: boolean;
}

export function SecurityCenter() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load 2FA status
      const { data: twoFactor } = await supabase
        .from('two_factor_auth')
        .select('is_enabled')
        .eq('user_id', user.id)
        .single();

      setTwoFactorEnabled(twoFactor?.is_enabled || false);

      // Load trusted devices
      const { data: devices } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_trusted', true);

      setTrustedDevices(devices || []);

      // Load security events
      const { data: events } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setSecurityEvents(events || []);
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  };

  const setupTwoFactor = async () => {
    const secret = await securityService.generateTOTPSecret();
    setTotpSecret(secret);
    setShowTwoFactorSetup(true);
  };

  const enableTwoFactor = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const success = await securityService.enableTwoFactor(user.id, totpSecret);
    if (success) {
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      loadSecurityData();
    }
  };

  const registerCurrentDevice = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fingerprint = securityService.generateDeviceFingerprint();
    const deviceName = `${navigator.platform} - ${new Date().toLocaleDateString()}`;
    
    const success = await securityService.registerTrustedDevice(user.id, fingerprint, deviceName);
    if (success) {
      loadSecurityData();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Security Center</h2>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Shield className={`w-5 h-5 ${twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
            <div>
              <p className="font-medium text-gray-900">Two-Factor Auth</p>
              <p className={`text-sm ${twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          {!twoFactorEnabled && (
            <button
              onClick={setupTwoFactor}
              className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
            >
              Enable 2FA
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Monitor className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Trusted Devices</p>
              <p className="text-sm text-gray-600">{trustedDevices.length} registered</p>
            </div>
          </div>
          <button
            onClick={registerCurrentDevice}
            className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
          >
            Trust This Device
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">Security Events</p>
              <p className="text-sm text-gray-600">{securityEvents.filter(e => !e.resolved).length} unresolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted Devices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trusted Devices</h3>
        <div className="space-y-3">
          {trustedDevices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{device.device_name}</p>
                  <p className="text-sm text-gray-600">
                    Last used: {new Date(device.last_used_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          ))}
          {trustedDevices.length === 0 && (
            <p className="text-gray-500 text-center py-4">No trusted devices registered</p>
          )}
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          {securityEvents.map((event) => (
            <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border">
              <div className={`p-1 rounded-full ${getSeverityColor(event.severity)}`}>
                <AlertTriangle className="w-3 h-3" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{event.event_type.replace('_', ' ')}</p>
                <p className="text-sm text-gray-600">{event.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
              {event.resolved && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
          ))}
          {securityEvents.length === 0 && (
            <p className="text-gray-500 text-center py-4">No security events</p>
          )}
        </div>
      </div>

      {/* Two-Factor Setup Modal */}
      {showTwoFactorSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Setup Two-Factor Authentication</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Secret Key:</p>
                <code className="text-xs bg-white p-2 rounded border block">{totpSecret}</code>
              </div>
              
              <p className="text-sm text-gray-600">
                Scan this secret with your authenticator app (Google Authenticator, Authy, etc.)
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTwoFactorSetup(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={enableTwoFactor}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}