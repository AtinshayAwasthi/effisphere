import React, { useState, useEffect } from 'react';
import { MapPin, Wifi, Battery, Smartphone } from 'lucide-react';

export function LocationStatus() {
  const [locationData, setLocationData] = useState({
    address: '',
    coordinates: '',
    accuracy: '',
    lastUpdate: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLocationData(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleTimeString()
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Status</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Location Verified</p>
              <p className="text-xs text-green-600">{locationData.address}</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Coordinates</span>
            <span className="font-mono text-gray-900">{locationData.coordinates}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Accuracy</span>
            <span className="text-green-600">{locationData.accuracy}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last Update</span>
            <span className="text-gray-900">{locationData.lastUpdate}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Device Status</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="p-2 bg-green-50 rounded-lg mb-2 mx-auto w-fit">
                <Wifi className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">WiFi Connected</p>
            </div>
            
            <div className="text-center">
              <div className="p-2 bg-green-50 rounded-lg mb-2 mx-auto w-fit">
                <Battery className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Battery 85%</p>
            </div>
            
            <div className="text-center">
              <div className="p-2 bg-green-50 rounded-lg mb-2 mx-auto w-fit">
                <Smartphone className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">GPS Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}