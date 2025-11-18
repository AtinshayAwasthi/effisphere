interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  metadata?: any;
}

interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  timestamp: Date;
  userId?: string;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorLog[] = [];

  // Performance monitoring
  trackPageLoad(pageName: string): void {
    const loadTime = performance.now();
    this.recordMetric('page_load_time', loadTime, { page: pageName });
  }

  trackApiCall(endpoint: string, duration: number, success: boolean): void {
    this.recordMetric('api_call_duration', duration, { 
      endpoint, 
      success,
      status: success ? 'success' : 'error'
    });
  }

  trackUserAction(action: string, duration?: number): void {
    this.recordMetric('user_action', duration || 0, { action });
  }

  // Error tracking
  logError(error: Error, context?: any): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: new Date(),
      userId: context?.userId
    };

    this.errors.push(errorLog);
    
    // In production, send to error tracking service
    console.error('Application Error:', errorLog);
  }

  // System health monitoring
  async checkSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    checks: Record<string, boolean>;
    responseTime: number;
  }> {
    const startTime = performance.now();
    const checks: Record<string, boolean> = {};

    try {
      // Database connectivity
      const { error: dbError } = await fetch('/api/health/database');
      checks.database = !dbError;

      // API responsiveness
      const apiStart = performance.now();
      const { error: apiError } = await fetch('/api/health/api');
      checks.api = !apiError;
      checks.apiResponseTime = performance.now() - apiStart < 1000;

      // Memory usage (simplified)
      checks.memory = (performance as any).memory ? 
        (performance as any).memory.usedJSHeapSize < 100 * 1024 * 1024 : true;

    } catch (error) {
      console.error('Health check failed:', error);
    }

    const responseTime = performance.now() - startTime;
    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;

    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (healthyChecks === 0) status = 'down';
    else if (healthyChecks < totalChecks) status = 'degraded';

    return { status, checks, responseTime };
  }

  // Analytics and reporting
  getMetrics(timeRange: number = 3600000): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - timeRange);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  getErrors(timeRange: number = 3600000): ErrorLog[] {
    const cutoff = new Date(Date.now() - timeRange);
    return this.errors.filter(e => e.timestamp >= cutoff);
  }

  generateReport(): {
    performance: any;
    errors: any;
    health: any;
  } {
    const metrics = this.getMetrics();
    const errors = this.getErrors();

    return {
      performance: {
        avgPageLoadTime: this.calculateAverage(metrics.filter(m => m.name === 'page_load_time')),
        avgApiResponseTime: this.calculateAverage(metrics.filter(m => m.name === 'api_call_duration')),
        totalUserActions: metrics.filter(m => m.name === 'user_action').length
      },
      errors: {
        totalErrors: errors.length,
        errorRate: errors.length / Math.max(metrics.length, 1),
        topErrors: this.getTopErrors(errors)
      },
      health: {
        uptime: this.calculateUptime(),
        lastCheck: new Date()
      }
    };
  }

  private recordMetric(name: string, value: number, metadata?: any): void {
    this.metrics.push({
      name,
      value,
      timestamp: new Date(),
      metadata
    });

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  private getTopErrors(errors: ErrorLog[]): Array<{message: string; count: number}> {
    const errorCounts = new Map<string, number>();
    
    errors.forEach(error => {
      const count = errorCounts.get(error.message) || 0;
      errorCounts.set(error.message, count + 1);
    });

    return Array.from(errorCounts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateUptime(): number {
    // Simplified uptime calculation
    const errors = this.getErrors(24 * 60 * 60 * 1000); // Last 24 hours
    const totalMinutes = 24 * 60;
    const errorMinutes = errors.length; // Simplified: 1 error = 1 minute downtime
    
    return Math.max(0, (totalMinutes - errorMinutes) / totalMinutes * 100);
  }
}

export const monitoringService = new MonitoringService();

// Global error handler
window.addEventListener('error', (event) => {
  monitoringService.logError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  monitoringService.logError(new Error(event.reason), {
    type: 'unhandled_promise_rejection'
  });
});