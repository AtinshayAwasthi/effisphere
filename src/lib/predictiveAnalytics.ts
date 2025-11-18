import { supabase } from './supabase';

interface PredictionData {
  date: string;
  predictedAttendance: number;
  predictedHours: number;
  confidence: number;
}

interface TrendData {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  change: number;
  prediction: string;
}

class PredictiveAnalyticsService {
  async predictAttendance(days: number = 7): Promise<PredictionData[]> {
    try {
      // Get historical data for the last 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const { data } = await supabase
        .from('attendance_records')
        .select('check_in_time, total_hours, employee_id')
        .gte('check_in_time', startDate.toISOString())
        .eq('status', 'completed');

      if (!data || data.length === 0) {
        return [];
      }

      // Group by date
      const dailyData = new Map<string, { attendance: number; hours: number }>();
      
      data.forEach(record => {
        const date = new Date(record.check_in_time).toISOString().split('T')[0];
        const existing = dailyData.get(date) || { attendance: 0, hours: 0 };
        existing.attendance++;
        existing.hours += record.total_hours || 0;
        dailyData.set(date, existing);
      });

      const sortedData = Array.from(dailyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({ date, ...data }));

      // Simple linear regression for prediction
      const predictions: PredictionData[] = [];
      const avgAttendance = sortedData.reduce((sum, d) => sum + d.attendance, 0) / sortedData.length;
      const avgHours = sortedData.reduce((sum, d) => sum + d.hours, 0) / sortedData.length;

      // Calculate trend
      const attendanceTrend = this.calculateTrend(sortedData.map(d => d.attendance));
      const hoursTrend = this.calculateTrend(sortedData.map(d => d.hours));

      for (let i = 1; i <= days; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        
        predictions.push({
          date: futureDate.toISOString().split('T')[0],
          predictedAttendance: Math.round(avgAttendance + (attendanceTrend * i)),
          predictedHours: Math.round((avgHours + (hoursTrend * i)) * 100) / 100,
          confidence: Math.max(0.5, 1 - (i * 0.1)) // Decreasing confidence over time
        });
      }

      return predictions;
    } catch (error) {
      console.error('Error predicting attendance:', error);
      return [];
    }
  }

  async analyzeTrends(): Promise<TrendData[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data } = await supabase
        .from('attendance_records')
        .select('check_in_time, total_hours')
        .gte('check_in_time', thirtyDaysAgo.toISOString())
        .eq('status', 'completed');

      if (!data || data.length === 0) {
        return [];
      }

      // Split data into two halves for comparison
      const midPoint = Math.floor(data.length / 2);
      const firstHalf = data.slice(0, midPoint);
      const secondHalf = data.slice(midPoint);

      const trends: TrendData[] = [];

      // Attendance trend
      const attendanceChange = ((secondHalf.length - firstHalf.length) / firstHalf.length) * 100;
      trends.push({
        metric: 'Attendance Rate',
        trend: attendanceChange > 5 ? 'increasing' : attendanceChange < -5 ? 'decreasing' : 'stable',
        change: Math.round(attendanceChange),
        prediction: this.generatePrediction('attendance', attendanceChange)
      });

      // Hours trend
      const firstHalfHours = firstHalf.reduce((sum, r) => sum + (r.total_hours || 0), 0) / firstHalf.length;
      const secondHalfHours = secondHalf.reduce((sum, r) => sum + (r.total_hours || 0), 0) / secondHalf.length;
      const hoursChange = ((secondHalfHours - firstHalfHours) / firstHalfHours) * 100;

      trends.push({
        metric: 'Average Hours',
        trend: hoursChange > 5 ? 'increasing' : hoursChange < -5 ? 'decreasing' : 'stable',
        change: Math.round(hoursChange),
        prediction: this.generatePrediction('hours', hoursChange)
      });

      // Punctuality trend
      const firstHalfOnTime = firstHalf.filter(r => new Date(r.check_in_time).getHours() <= 9).length;
      const secondHalfOnTime = secondHalf.filter(r => new Date(r.check_in_time).getHours() <= 9).length;
      const punctualityChange = ((secondHalfOnTime / secondHalf.length) - (firstHalfOnTime / firstHalf.length)) * 100;

      trends.push({
        metric: 'Punctuality',
        trend: punctualityChange > 5 ? 'increasing' : punctualityChange < -5 ? 'decreasing' : 'stable',
        change: Math.round(punctualityChange),
        prediction: this.generatePrediction('punctuality', punctualityChange)
      });

      return trends;
    } catch (error) {
      console.error('Error analyzing trends:', error);
      return [];
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (val * index), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private generatePrediction(metric: string, change: number): string {
    const absChange = Math.abs(change);
    
    if (absChange < 5) {
      return `${metric} expected to remain stable`;
    } else if (change > 0) {
      return `${metric} trending upward by ${absChange}%`;
    } else {
      return `${metric} declining by ${absChange}%`;
    }
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService();