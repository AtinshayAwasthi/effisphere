import { supabase } from './supabase';

export interface AttendanceStats {
  totalHours: number;
  daysWorked: number;
  averageHoursPerDay: number;
  onTimePercentage: number;
}

export interface DepartmentStats {
  department: string;
  employeeCount: number;
  totalHours: number;
  averageHours: number;
}

class AnalyticsService {
  async getEmployeeStats(employeeId: string, days: number = 30): Promise<AttendanceStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await supabase
        .from('attendance_records')
        .select('total_hours, check_in_time')
        .eq('employee_id', employeeId)
        .eq('status', 'completed')
        .gte('check_in_time', startDate.toISOString());

      const records = data || [];
      const totalHours = records.reduce((sum, record) => sum + (record.total_hours || 0), 0);
      const daysWorked = records.length;
      const averageHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;
      
      // Calculate on-time percentage (assuming 9 AM is start time)
      const onTimeCount = records.filter(record => {
        const checkInTime = new Date(record.check_in_time);
        return checkInTime.getHours() <= 9;
      }).length;
      
      const onTimePercentage = daysWorked > 0 ? (onTimeCount / daysWorked) * 100 : 0;

      return {
        totalHours: Math.round(totalHours * 100) / 100,
        daysWorked,
        averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
        onTimePercentage: Math.round(onTimePercentage)
      };
    } catch (error) {
      return { totalHours: 0, daysWorked: 0, averageHoursPerDay: 0, onTimePercentage: 0 };
    }
  }

  async getDepartmentStats(): Promise<DepartmentStats[]> {
    try {
      const { data } = await supabase
        .from('employees')
        .select(`
          department,
          attendance_records!inner(total_hours)
        `)
        .eq('attendance_records.status', 'completed');

      const departmentMap = new Map<string, { count: number; totalHours: number }>();
      
      data?.forEach(employee => {
        const dept = employee.department || 'Unknown';
        const current = departmentMap.get(dept) || { count: 0, totalHours: 0 };
        
        current.count++;
        employee.attendance_records.forEach((record: any) => {
          current.totalHours += record.total_hours || 0;
        });
        
        departmentMap.set(dept, current);
      });

      return Array.from(departmentMap.entries()).map(([department, stats]) => ({
        department,
        employeeCount: stats.count,
        totalHours: Math.round(stats.totalHours * 100) / 100,
        averageHours: Math.round((stats.totalHours / stats.count) * 100) / 100
      }));
    } catch (error) {
      return [];
    }
  }

  async getWeeklyAttendance(employeeId: string): Promise<{ date: string; hours: number }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const { data } = await supabase
        .from('attendance_records')
        .select('check_in_time, total_hours')
        .eq('employee_id', employeeId)
        .eq('status', 'completed')
        .gte('check_in_time', startDate.toISOString())
        .order('check_in_time');

      const weeklyData: { [key: string]: number } = {};
      
      data?.forEach(record => {
        const date = new Date(record.check_in_time).toISOString().split('T')[0];
        weeklyData[date] = (weeklyData[date] || 0) + (record.total_hours || 0);
      });

      return Object.entries(weeklyData).map(([date, hours]) => ({
        date,
        hours: Math.round(hours * 100) / 100
      }));
    } catch (error) {
      return [];
    }
  }

  async getOverallMetrics(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    totalHoursToday: number;
    averageProductivity: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [employeeCount, todayRecords] = await Promise.all([
        supabase.from('employees').select('id, status').eq('status', 'active'),
        supabase
          .from('attendance_records')
          .select('total_hours, employee_id')
          .gte('check_in_time', today.toISOString())
      ]);

      const totalEmployees = employeeCount.data?.length || 0;
      const activeToday = new Set(todayRecords.data?.map(r => r.employee_id)).size;
      const totalHoursToday = todayRecords.data?.reduce((sum, r) => sum + (r.total_hours || 0), 0) || 0;
      const averageProductivity = activeToday > 0 ? (totalHoursToday / activeToday) * 12.5 : 0; // 8 hours = 100%

      return {
        totalEmployees,
        activeEmployees: activeToday,
        totalHoursToday: Math.round(totalHoursToday * 100) / 100,
        averageProductivity: Math.round(averageProductivity)
      };
    } catch (error) {
      return { totalEmployees: 0, activeEmployees: 0, totalHoursToday: 0, averageProductivity: 0 };
    }
  }
}

export const analyticsService = new AnalyticsService();