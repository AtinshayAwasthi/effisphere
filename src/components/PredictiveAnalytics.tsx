import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Users, Clock } from 'lucide-react';
import { predictiveAnalyticsService } from '../lib/predictiveAnalytics';

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

export function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [predictionsData, trendsData] = await Promise.all([
        predictiveAnalyticsService.predictAttendance(7),
        predictiveAnalyticsService.analyzeTrends()
      ]);
      
      setPredictions(predictionsData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading predictive analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'decreasing': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600 bg-green-50';
      case 'decreasing': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>

      {/* Trend Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trends.map((trend, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getTrendColor(trend.trend)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{trend.metric}</h4>
                {getTrendIcon(trend.trend)}
              </div>
              <p className="text-2xl font-bold mb-1">
                {trend.change > 0 ? '+' : ''}{trend.change}%
              </p>
              <p className="text-sm opacity-75">{trend.prediction}</p>
            </div>
          ))}
          {trends.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              <p>No trend data available</p>
            </div>
          )}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Attendance Forecast</h3>
        
        {predictions.length > 0 ? (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {Math.round(predictions.reduce((sum, p) => sum + p.predictedAttendance, 0) / predictions.length)}
                    </p>
                    <p className="text-sm text-blue-700">Avg Daily Attendance</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      {Math.round(predictions.reduce((sum, p) => sum + p.predictedHours, 0) / predictions.length)}h
                    </p>
                    <p className="text-sm text-green-700">Avg Daily Hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100)}%
                    </p>
                    <p className="text-sm text-purple-700">Avg Confidence</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Forecast */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Day</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Predicted Attendance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Predicted Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((prediction, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(prediction.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(prediction.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{prediction.predictedAttendance}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-gray-900">{prediction.predictedHours}h</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${prediction.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round(prediction.confidence * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No historical data available for predictions</p>
            <p className="text-sm mt-2">Predictions will be available after collecting attendance data</p>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">AI Insights</h3>
        <div className="space-y-3 text-blue-800">
          <p>• Predictive models analyze 30 days of historical data to forecast attendance patterns</p>
          <p>• Confidence levels decrease over time - short-term predictions are more accurate</p>
          <p>• Trend analysis compares recent performance with historical averages</p>
          <p>• Use predictions for workforce planning and resource allocation</p>
        </div>
      </div>
    </div>
  );
}