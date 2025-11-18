import React, { useEffect, useState } from 'react';
import { MapPin, Wifi, Satellite, AlertCircle, CheckCircle, Navigation, Clock, MapPinned } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';
import { useEmployeeStore } from '../store/employeeStore';
import { supabase } from '../lib/supabase';

interface LocationLog {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  log_type: string;
  address: string;
  created_at: string;
}

export function GeolocationTracker() {
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'disabled' | 'requesting' | 'active' | 'error'>('disabled');
  const [locationHistory, setLocationHistory] = useState<LocationLog[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');

  const { currentLocation, setCurrentLocation } = useLocationStore();
  const { currentUser } = useEmployeeStore();

  useEffect(() => {
    if (currentUser) {
      loadLocationHistory();
    }
  }, [currentUser]);

  useEffect(() => {
    if (isTracking && 'geolocation' in navigator) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => stopLocationTracking();
  }, [isTracking]);

  const loadLocationHistory = async () => {
    // Mock location history for demo
    setLocationHistory([]);
  };

  const startLocationTracking = () => {
    setLocationStatus('requesting');
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    const successCallback = async (position: GeolocationPosition) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date()
      };

      setCurrentLocation(location);
      setLocationStatus('active');

      await reverseGeocode(location.lat, location.lng);
      await saveLocationLog(location, 'periodic');
    };

    const errorCallback = (error: GeolocationPositionError) => {
      setLocationStatus('error');
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationError('Location access denied. Please enable location permissions in your browser settings.');
          break;
        case error.POSITION_UNAVAILABLE:
          setLocationError('Location information unavailable. Please check your GPS settings.');
          break;
        case error.TIMEOUT:
          setLocationError('Location request timed out. Please try again.');
          break;
        default:
          setLocationError('Unknown location error occurred.');
          break;
      }
    };

    const id = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );

    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setLocationStatus('disabled');
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setCurrentAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const saveLocationLog = async (
    location: { lat: number; lng: number; accuracy?: number },
    logType: 'check-in' | 'check-out' | 'periodic'
  ) => {
    // Mock location saving for demo
    console.log(`Location ${logType}:`, location);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Location Saved', {
        body: `Your location has been recorded at ${new Date().toLocaleTimeString()}`,
      });
    }
  };

  const handleCheckIn = async () => {
    if (currentLocation) {
      await saveLocationLog(currentLocation, 'check-in');
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Checked In', {
          body: 'Successfully checked in at your current location',
        });
      }
    }
  };

  const handleCheckOut = async () => {
    if (currentLocation) {
      await saveLocationLog(currentLocation, 'check-out');
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Checked Out', {
          body: 'Successfully checked out from your location',
        });
      }
    }
  };

  const toggleLocationTracking = async () => {
    if (!isTracking) {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      setIsTracking(true);
    } else {
      setIsTracking(false);
    }
  };

  const getLocationStatusIcon = () => {
    switch (locationStatus) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'requesting':
        return <Satellite className="w-5 h-5 text-yellow-600 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLocationStatusText = () => {
    switch (locationStatus) {
      case 'active':
        return 'Location Active';
      case 'requesting':
        return 'Getting Location...';
      case 'error':
        return 'Location Error';
      default:
        return 'Location Disabled';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Geolocation Tracker</h3>
          </div>

          <button
            onClick={toggleLocationTracking}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isTracking
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getLocationStatusIcon()}
              <div>
                <p className="font-medium text-gray-900">{getLocationStatusText()}</p>
                {locationError && (
                  <p className="text-sm text-red-600 mt-1">{locationError}</p>
                )}
              </div>
            </div>

            {currentLocation && (
              <div className="text-right">
                <p className="text-sm font-mono text-gray-600">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
                <p className="text-xs text-gray-500">
                  Accuracy: ±{currentLocation.accuracy?.toFixed(0) || 'Unknown'}m
                </p>
              </div>
            )}
          </div>

          {currentAddress && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <MapPinned className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <span className="font-medium text-blue-800 text-sm">Current Address</span>
                  <p className="text-sm text-blue-700 mt-1">{currentAddress}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleCheckIn}
              disabled={!currentLocation}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!currentLocation}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Check Out
            </button>
          </div>

          {!('geolocation' in navigator) && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Geolocation Not Supported</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your browser doesn't support geolocation. Please use a modern browser.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Location History</h3>
        </div>

        <div className="space-y-2">
          {locationHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No location history yet</p>
              <p className="text-sm">Start tracking to see your location logs</p>
            </div>
          ) : (
            locationHistory.map((log) => (
              <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.log_type === 'check-in'
                          ? 'bg-green-100 text-green-700'
                          : log.log_type === 'check-out'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {log.log_type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      {log.address || 'Address not available'}
                    </p>
                    <p className="text-xs font-mono text-gray-500">
                      {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    ±{log.accuracy.toFixed(0)}m
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h4 className="font-medium text-gray-900 mb-3">How to Use</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <Navigation className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Enable location permissions</strong> in your phone browser settings to track your location</p>
          </div>
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Start Tracking</strong> to begin real-time location monitoring</p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Check In/Out</strong> manually to log your attendance at specific locations</p>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>View History</strong> to see all your location logs and track your movements</p>
          </div>
        </div>
      </div>
    </div>
  );
}
