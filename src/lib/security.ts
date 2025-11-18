import { supabase } from './supabase';

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: any;
}

class SecurityService {
  async logSecurityEvent(userId: string, event: SecurityEvent): Promise<void> {
    try {
      await supabase
        .from('security_events')
        .insert({
          user_id: userId,
          event_type: event.type,
          severity: event.severity,
          description: event.description,
          metadata: event.metadata,
          ip_address: '127.0.0.1', // In production, get real IP
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  async generateTOTPSecret(): Promise<string> {
    // Generate a base32 secret for TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  async enableTwoFactor(userId: string, secret: string): Promise<boolean> {
    try {
      const backupCodes = this.generateBackupCodes();
      
      const { error } = await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: userId,
          secret,
          is_enabled: true,
          backup_codes: backupCodes,
          enabled_at: new Date().toISOString()
        });

      if (!error) {
        await this.logSecurityEvent(userId, {
          type: 'two_factor_enabled',
          severity: 'medium',
          description: 'Two-factor authentication enabled'
        });
      }

      return !error;
    } catch (error) {
      return false;
    }
  }

  async registerTrustedDevice(userId: string, deviceFingerprint: string, deviceName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trusted_devices')
        .upsert({
          user_id: userId,
          device_fingerprint: deviceFingerprint,
          device_name: deviceName,
          last_used_at: new Date().toISOString()
        });

      if (!error) {
        await this.logSecurityEvent(userId, {
          type: 'device_registered',
          severity: 'low',
          description: `Trusted device registered: ${deviceName}`
        });
      }

      return !error;
    } catch (error) {
      return false;
    }
  }

  async isDeviceTrusted(userId: string, deviceFingerprint: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('trusted_devices')
        .select('id')
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint)
        .eq('is_trusted', true)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  generateDeviceFingerprint(): string {
    // Simple device fingerprinting (in production, use more sophisticated methods)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    return btoa(fingerprint).substring(0, 32);
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  async encryptSensitiveData(data: any): Promise<string> {
    // Simple encryption (in production, use proper encryption)
    return btoa(JSON.stringify(data));
  }

  async decryptSensitiveData(encryptedData: string): Promise<any> {
    try {
      return JSON.parse(atob(encryptedData));
    } catch (error) {
      return null;
    }
  }
}

export const securityService = new SecurityService();