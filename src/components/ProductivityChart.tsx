import React from 'react';
import { TrendingUp } from 'lucide-react';

export function ProductivityChart() {
  const productivityData = [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Daily Productivity</h3>
        </div>
        <div className="text-sm text-gray-600">
          Peak: <span className="font-semibold text-blue-600">0%</span>
        </div>
      </div>

      <div className="relative h-48 mb-4">
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No productivity data available</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Average Productivity</span>
          <span className="font-semibold text-blue-600">0%</span>
        </div>
      </div>
    </div>
  );
}