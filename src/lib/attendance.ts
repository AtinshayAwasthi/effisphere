import { supabase } from './supabase';
import { notificationService } from './notificationService';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in_time: string;
  check_out_time?: string;
  total_hours?: number;
  status: 'active' | 'completed' | 'incomplete';
}

class AttendanceService {
  async checkIn(employeeId: string, location?: { lat: number; lng: number; accuracy?: number }): Promise<{ success: boolean; recordId?: string; error?: string }> {
    try {
      // Check if already checked in - use maybeSingle to avoid 406 error
      const { data: activeRecord, error: checkError } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .maybeSingle();

      if (checkError) {
        console.error('Error checking active record:', checkError);
      }

      if (activeRecord) {
        return { success: false, error: 'Already checked in' };
      }

      // Create new attendance record
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          employee_id: employeeId,
          check_in_time: new Date().toISOString(),
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
          location_accuracy: location?.accuracy ? Math.round(location.accuracy) : null,
          check_in_method: location ? 'geofence' : 'manual',
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      return { success: true, recordId: data.id };
    } catch (error) {
      console.error('Check-in error:', error);
      return { success: false, error: error.message || 'Check-in failed' };
    }
  }

  async checkOut(employeeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find active record
      const { data: activeRecord, error: findError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .maybeSingle();

      if (findError) {
        console.error('Error finding active record:', findError);
        return { success: false, error: 'Error finding active session' };
      }

      if (!activeRecord) {
        return { success: false, error: 'No active check-in found' };
      }

      // Calculate total hours
      const checkInTime = new Date(activeRecord.check_in_time);
      const checkOutTime = new Date();
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      // Update record
      const { error } = await supabase
        .from('attendance_records')
        .update({
          check_out_time: checkOutTime.toISOString(),
          total_hours: Math.round(totalHours * 100) / 100,
          status: 'completed'
        })
        .eq('id', activeRecord.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Check-out error:', error);
      return { success: false, error: error.message || 'Check-out failed' };
    }
  }

  async getActiveRecord(employeeId: string): Promise<AttendanceRecord | null> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error getting active record:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getActiveRecord:', error);
      return null;
    }
  }

  async getTodayRecords(employeeId: string): Promise<AttendanceRecord[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('check_in_time', today.toISOString())
        .order('check_in_time', { ascending: false });

      return data || [];
    } catch (error) {
      return [];
    }
  }
}

export const attendanceService = new AttendanceService();