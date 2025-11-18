import React, { useEffect, useState } from 'react';
import { MapPin, CheckCircle, AlertCircle, Navigation2, Clock, Smartphone, Shield, Zap } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';
import { useEmployeeStore } from '../store/employeeStore';
import { supabase } from '../lib/supabase';

interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  status: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  requires_face_verification?: boolean;
  location_log_id?: string;
  geofence?: Geofence;
  distance?: number;
  error?: string;
}

export function GeolocationAttendance() {
  const [isTracking, setIsTracking] = useState(false);
  const [showCheckInPrompt, setShowCheckInPrompt] = useState(false);
  const [nearbyOffice, setNearbyOffice] = useState<Geofence | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string>('');
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const { currentLocation, setCurrentLocation } = useLocationStore();
  const { currentUser } = useEmployeeStore();

  useEffect(() => {
    if (isTracking && 'geolocation' in navigator) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [isTracking]);

  useEffect(() => {
    if (currentLocation && isTracking) {
      checkProximityToOffice();
    }
  }, [currentLocation, isTracking]);

  const startTracking = () => {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    };

    const successCallback = (position: GeolocationPosition) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date()
      };
      setCurrentLocation(location);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.error('Location error:', error);
    };

    const id = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const checkProximityToOffice = async () => {
    if (!currentLocation || attendanceMarked) return;

    try {
      const { data: geofences, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      let nearestOffice: Geofence | null = null;
      let minDistance = Infinity;
      let withinRadius = false;

      for (const fence of geofences as Geofence[]) {
        const dist = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          parseFloat(fence.latitude.toString()),
          parseFloat(fence.longitude.toString())
        );

        if (dist < minDistance) {
          minDistance = dist;
          nearestOffice = fence;
        }

        if (dist <= fence.radius) {
          withinRadius = true;
          nearestOffice = fence;
          break;
        }
      }

      setDistance(Math.round(minDistance));

      if (withinRadius && nearestOffice) {
        setNearbyOffice(nearestOffice);
        setShowCheckInPrompt(true);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Office Detected', {
            body: `You're near ${nearestOffice.name}. Ready to check in?`,
          });
        }
      } else {
        setShowCheckInPrompt(false);
        setNearbyOffice(null);
      }
    } catch (error) {
      console.error('Error checking proximity:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!currentLocation || !currentUser) return;

    setIsVerifying(true);
    setVerificationMessage('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-attendance`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: currentUser.id,
          timestamp: new Date().toISOString(),
          gps_location: {
            lat: currentLocation.lat,
            long: currentLocation.lng,
          },
        }),
      });

      const result: VerificationResponse = await response.json();

      if (result.success && result.requires_face_verification) {
        setVerificationMessage(result.message);
        setShowCheckInPrompt(false);
        setTimeout(() => {
          window.location.hash = '#face-verification';
        }, 1500);
      } else if (!result.success) {
        setVerificationMessage(result.message || 'Verification failed');

        if (result.error === 'already_marked') {
          setAttendanceMarked(true);
          setShowCheckInPrompt(false);
        }
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setVerificationMessage('Failed to verify attendance. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDismiss = () => {
    setShowCheckInPrompt(false);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleStartTracking = async () => {
    await requestNotificationPermission();
    setIsTracking(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Smart Attendance</h2>
            <p className="text-blue-100">Automatic check-in when you arrive</p>
          </div>
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
            <Smartphone className="w-10 h-10" />
          </div>
        </div>

        <button
          onClick={handleStartTracking}
          disabled={isTracking}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform ${
            isTracking
              ? 'bg-white/20 cursor-not-allowed'
              : 'bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 shadow-lg'
          }`}
        >
          {isTracking ? (
            <span className="flex items-center justify-center space-x-2">
              <Zap className="w-5 h-5 animate-pulse" />
              <span>Tracking Active</span>
            </span>
          ) : (
            'Enable Auto Check-In'
          )}
        </button>
      </div>

      {isTracking && currentLocation && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Navigation2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Location Status</h3>
              <p className="text-sm text-gray-600">GPS tracking active</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Current Position</span>
              <span className="text-sm font-mono text-gray-900">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </span>
            </div>

            {distance !== null && nearbyOffice && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-900 font-medium">Distance to {nearbyOffice.name}</span>
                <span className="text-sm font-bold text-blue-700">{distance}m</span>
              </div>
            )}

            {attendanceMarked && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Attendance marked for today</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCheckInPrompt && nearbyOffice && !attendanceMarked && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-2xl p-6 text-white animate-pulse">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">You're near the office!</h3>
              <p className="text-emerald-50 text-lg">{nearbyOffice.name}</p>
              {distance && (
                <p className="text-emerald-100 text-sm mt-1">
                  {distance}m away · Within check-in range
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCheckIn}
              disabled={isVerifying}
              className="flex-1 py-4 px-6 bg-white text-emerald-600 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center space-x-2">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Check In Now</span>
                </span>
              )}
            </button>
            <button
              onClick={handleDismiss}
              disabled={isVerifying}
              className="px-6 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {verificationMessage && (
        <div className={`p-5 rounded-xl border-2 ${
          verificationMessage.includes('success') || verificationMessage.includes('face verification')
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-start space-x-3">
            {verificationMessage.includes('success') || verificationMessage.includes('face verification') ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className={`font-medium ${
                verificationMessage.includes('success') || verificationMessage.includes('face verification')
                  ? 'text-green-900'
                  : 'text-red-900'
              }`}>
                {verificationMessage}
              </p>
              {verificationMessage.includes('face verification') && (
                <p className="text-sm text-green-700 mt-2">
                  Redirecting to face verification...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">How It Works</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Enable Auto Check-In</p>
              <p className="text-sm text-gray-600">Turn on GPS tracking to monitor your location</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Arrive at Office</p>
              <p className="text-sm text-gray-600">When within 200m, you'll get a check-in prompt</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Verify Location</p>
              <p className="text-sm text-gray-600">System confirms you're within allowed radius</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-medium text-gray-900">Face Verification</p>
              <p className="text-sm text-gray-600">Complete face scan to mark attendance</p>
            </div>
          </div>
        </div>
      </div>

      {!isTracking && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Location tracking disabled</p>
              <p className="text-sm text-amber-700 mt-1">
                Enable auto check-in to start monitoring your proximity to office locations
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
