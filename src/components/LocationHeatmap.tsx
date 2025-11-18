import React, { useState, useEffect } from 'react';
import { MapPin, Users, Clock, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LocationData {
  lat: number;
  lng: number;
  count: number;
  hours: number;
  employees: string[];
}

export function LocationHeatmap() {
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [dateRange, setDateRange] = useState('7');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocationData();
  }, [dateRange]);

  const loadLocationData = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const { data } = await supabase
        .from('attendance_records')
        .select(`
          location_lat,
          location_lng,
          total_hours,
          employees!inner(full_name)
        `)
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .gte('check_in_time', startDate.toISOString());

      // Group by location (rounded to reduce precision)
      const locationMap = new Map<string, LocationData>();
      
      data?.forEach(record => {
        const lat = Math.round(record.location_lat * 1000) / 1000;
        const lng = Math.round(record.location_lng * 1000) / 1000;
        const key = `${lat},${lng}`;
        
        const existing = locationMap.get(key) || {
          lat,
          lng,
          count: 0,
          hours: 0,
          employees: []
        };
        
        existing.count++;
        existing.hours += record.total_hours || 0;
        if (!existing.employees.includes((record.employees as any).full_name)) {
          existing.employees.push((record.employees as any).full_name);
        }
        
        locationMap.set(key, existing);
      });

      setLocationData(Array.from(locationMap.values()));
    } catch (error) {
      console.error('Error loading location data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (intensity: number, maxIntensity: number) => {
    const ratio = intensity / maxIntensity;
    if (ratio > 0.8) return 'bg-red-500';
    if (ratio > 0.6) return 'bg-orange-500';
    if (ratio > 0.4) return 'bg-yellow-500';
    if (ratio > 0.2) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const maxCount = Math.max(...locationData.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Location Heatmap</h2>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap Visualization */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Heatmap</h3>
            <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
              {locationData.map((location, index) => {
                const intensity = location.count / maxCount;
                const size = Math.max(20, intensity * 60);
                
                return (
                  <div
                    key={index}
                    className={`absolute rounded-full opacity-70 ${getHeatmapColor(location.count, maxCount)}`}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `${(location.lng + 180) / 360 * 100}%`,
                      top: `${(90 - location.lat) / 180 * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    title={`${location.count} check-ins, ${location.hours.toFixed(1)}h`}
                  />
                );
              })}
              {locationData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  No location data available
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Low</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>High</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Very High</span>
              </div>
            </div>
          </div>

          {/* Location Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{locationData.length}</p>
                  <p className="text-sm text-gray-600">Active Locations</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(locationData.flatMap(l => l.employees)).size}
                  </p>
                  <p className="text-sm text-gray-600">Unique Employees</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {locationData.reduce((sum, l) => sum + l.hours, 0).toFixed(0)}h
                  </p>
                  <p className="text-sm text-gray-600">Total Hours</p>
                </div>
              </div>
            </div>

            {/* Top Locations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Top Locations</h4>
              <div className="space-y-2">
                {locationData
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((location, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
                      </span>
                      <span className="font-medium text-gray-900">{location.count}</span>
                    </div>
                  ))}
                {locationData.length === 0 && (
                  <p className="text-gray-500 text-sm">No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}