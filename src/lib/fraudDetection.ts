import { supabase } from './supabase';

interface FraudAlert {
  type: 'location_spoofing' | 'time_manipulation' | 'device_sharing' | 'pattern_anomaly';
  severity: 'low' | 'medium' | 'high';
  employeeId: string;
  description: string;
  evidence: any;
}

class FraudDetectionService {
  async detectLocationSpoofing(employeeId: string, lat: number, lng: number, accuracy: number): Promise<FraudAlert | null> {
    // Check for impossible travel speed
    const { data: lastRecord } = await supabase
      .from('attendance_records')
      .select('location_lat, location_lng, check_in_time')
      .eq('employee_id', employeeId)
      .not('location_lat', 'is', null)
      .order('check_in_time', { ascending: false })
      .limit(1)
      .single();

    if (lastRecord && lastRecord.location_lat && lastRecord.location_lng) {
      const distance = this.calculateDistance(
        lastRecord.location_lat,
        lastRecord.location_lng,
        lat,
        lng
      );
      
      const timeDiff = (Date.now() - new Date(lastRecord.check_in_time).getTime()) / 1000 / 60; // minutes
      const speed = distance / (timeDiff / 60); // km/h

      if (speed > 500) { // Impossible speed (faster than plane)
        return {
          type: 'location_spoofing',
          severity: 'high',
          employeeId,
          description: `Impossible travel speed detected: ${speed.toFixed(0)} km/h`,
          evidence: { distance, timeDiff, speed, accuracy }
        };
      }
    }

    // Check for poor GPS accuracy (possible spoofing)
    if (accuracy > 1000) {
      return {
        type: 'location_spoofing',
        severity: 'medium',
        employeeId,
        description: `Poor GPS accuracy: ${accuracy}m (possible spoofing)`,
        evidence: { accuracy, lat, lng }
      };
    }

    return null;
  }

  async detectTimePatternAnomalies(employeeId: string): Promise<FraudAlert | null> {
    const { data: records } = await supabase
      .from('attendance_records')
      .select('check_in_time')
      .eq('employee_id', employeeId)
      .eq('status', 'completed')
      .order('check_in_time', { ascending: false })
      .limit(10);

    if (!records || records.length < 5) return null;

    // Check for identical check-in times (suspicious)
    const checkInTimes = records.map(r => new Date(r.check_in_time).getTime());
    const uniqueTimes = new Set(checkInTimes);
    
    if (uniqueTimes.size < checkInTimes.length * 0.7) {
      return {
        type: 'time_manipulation',
        severity: 'high',
        employeeId,
        description: 'Suspicious pattern: Too many identical check-in times',
        evidence: { records: records.length, uniqueTimes: uniqueTimes.size }
      };
    }

    return null;
  }

  async detectDeviceSharing(employeeId: string): Promise<FraudAlert | null> {
    // Check for multiple simultaneous sessions (simplified)
    const { data: activeSessions } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('status', 'active');

    if (activeSessions && activeSessions.length > 1) {
      return {
        type: 'device_sharing',
        severity: 'medium',
        employeeId,
        description: 'Multiple active sessions detected',
        evidence: { activeSessions: activeSessions.length }
      };
    }

    return null;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const fraudDetectionService = new FraudDetectionService();