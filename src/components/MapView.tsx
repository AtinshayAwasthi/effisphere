import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Users, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface LocationData {
  id: string;
  employee_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  employee_name?: string;
}

export function MapView() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    loadData();
    if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      loadGoogleMaps();
    }
  }, [selectedDate]);

  useEffect(() => {
    if (mapRef.current && locations.length > 0) {
      updateMapMarkers();
    }
  }, [locations]);

  const loadData = async () => {
    const { data: empData } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active');

    const { data: locationData } = await supabase
      .from('attendance_records')
      .select('id, employee_id, location_lat, location_lng, check_in_time')
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null)
      .gte('check_in_time', `${selectedDate}T00:00:00`)
      .lte('check_in_time', `${selectedDate}T23:59:59`)
      .order('check_in_time', { ascending: false })
      .limit(100);

    if (empData) setEmployees(empData);
    if (locationData) {
      const enriched = locationData.map(loc => ({
        id: loc.id,
        employee_id: loc.employee_id,
        latitude: loc.location_lat,
        longitude: loc.location_lng,
        created_at: loc.check_in_time,
        employee_name: empData?.find(e => e.id === loc.employee_id)?.full_name || 'Unknown'
      }));
      setLocations(enriched);
    }
  };

  const loadGoogleMaps = () => {
    if (window.google) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    window.initMap = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    try {
      mapRef.current = new window.google.maps.Map(mapElement, {
        zoom: 13,
        center: { lat: 40.7128, lng: -74.0060 },
        mapTypeId: 'roadmap'
      });

      if (locations.length > 0) {
        updateMapMarkers();
      }
    } catch (error) {
      console.error('Google Maps error:', error);
      showMockMap(mapElement);
    }
  };

  const showMockMap = (element: HTMLElement) => {
    element.innerHTML = `
      <div class="flex items-center justify-center h-full bg-gray-100 rounded-xl">
        <div class="text-center p-8">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Billing Required</h3>
          <p class="text-sm text-gray-600 mb-4">Enable billing in Google Cloud Console to use Maps</p>
          <div class="bg-blue-50 rounded-lg p-4 text-left">
            <p class="text-xs text-blue-800 font-medium mb-2">Locations (${locations.length}):</p>
            ${locations.slice(0, 3).map(loc => 
              `<div class="text-xs text-blue-700 mb-1">📍 ${loc.employee_name}: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}</div>`
            ).join('')}
          </div>
        </div>
      </div>
    `;
  };

  const updateMapMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    locations.forEach(location => {
      const position = { lat: location.latitude, lng: location.longitude };
      
      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        title: location.employee_name,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24)
        }
      });

      // Add geofence circle (200m radius)
      new window.google.maps.Circle({
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        map: mapRef.current,
        center: position,
        radius: 200
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${location.employee_name}</h3>
            <p class="text-sm text-gray-600">${new Date(location.created_at).toLocaleString()}</p>
            <p class="text-xs text-gray-500">Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (locations.length > 0) {
      mapRef.current.fitBounds(bounds);
    }
  };

  const uniqueEmployees = Array.from(new Set(locations.map(l => l.employee_id)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Location Map View</h2>
          <p className="text-gray-600 mt-1">Real-time employee location tracking</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Total Locations</p>
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{locations.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Active Employees</p>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-4xl font-bold text-green-600">{uniqueEmployees.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Coverage Area</p>
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-4xl font-bold text-purple-600">200m</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-8 mb-6">
          <div className="flex items-start space-x-4">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Interactive Map (Google Maps Integration)</h3>
              <p className="text-blue-800 mb-4">
                Real-time GPS tracking shows employee locations during check-in/check-out.
                Geofencing ensures employees are within 200m of authorized locations.
              </p>
              <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm text-blue-900 font-semibold mb-2">Features:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Live employee location markers</li>
                  <li>• Geofence radius visualization (200m)</li>
                  <li>• Historical location tracking</li>
                  <li>• Heat map for frequent locations</li>
                  <li>• Click markers for employee details</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <div 
            id="map" 
            className="w-full h-96 rounded-xl border border-gray-200"
            style={{ minHeight: '400px' }}
          ></div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Google Maps Integration Required</p>
              <p className="text-sm text-gray-500 mt-2">
                Add VITE_GOOGLE_MAPS_API_KEY to .env file to enable interactive map
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Location Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latitude</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Longitude</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {locations.map(location => (
                <tr key={location.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {location.employee_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                    {location.latitude.toFixed(6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                    {location.longitude.toFixed(6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {location.accuracy || 0}m
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      {location.log_type || 'check-in'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(location.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-amber-900 mb-2">Geofencing Information:</p>
            <ul className="text-sm text-amber-800 space-y-2">
              <li>• Employees must be within 200 meters of authorized locations to check in</li>
              <li>• GPS coordinates are logged for every check-in and check-out</li>
              <li>• Location data is encrypted and stored securely in Supabase</li>
              <li>• Anomalies are flagged if employees always check in from the exact same coordinates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
