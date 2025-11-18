import React, { useState, useEffect } from 'react';
import { MapPin, Wifi, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { GeofencingService, WorkLocation } from '../lib/geofencing';
import { supabase } from '../lib/supabase';

interface LocationTrackerProps {
  onLocationChange?: (inWorkArea: boolean, location?: WorkLocation) => void;
}

export function LocationTracker({ onLocationChange }: LocationTrackerProps) {
  const location = useGeolocation();
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [currentWorkLocation, setCurrentWorkLocation] = useState<WorkLocation | null>(null);
  const [isInWorkArea, setIsInWorkArea] = useState(false);

  useEffect(() => {
    loadWorkLocations();
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude && workLocations.length > 0) {
      checkGeofence();
    }
  }, [location.latitude, location.longitude, workLocations]);

  const loadWorkLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('work_locations')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error('Supabase error:', error);
        return;
      }
      
      console.log('Loaded work locations:', data);
      if (data) setWorkLocations(data);
    } catch (error) {
      console.error('Error loading work locations:', error);
    }
  };

  const checkGeofence = () => {
    if (!location.latitude || !location.longitude) {
      console.log('No location coordinates available');
      return;
    }

    let inArea = false;
    let nearestWorkLocation = null;
    let minDistance = Infinity;

    // Check each work location
    for (const workLoc of workLocations) {
      const distance = GeofencingService.calculateDistance(
        location.latitude,
        location.longitude,
        workLoc.latitude,
        workLoc.longitude
      );
      
      console.log(`Distance to ${workLoc.name}:`, distance, 'meters');
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestWorkLocation = workLoc;
      }
      
      // Check if within any work location's radius (use 1000m for testing)
      if (distance <= 1000) {
        inArea = true;
      }
    }

    console.log('Nearest location:', nearestWorkLocation?.name, 'Distance:', minDistance);
    console.log('In work area:', inArea);

    setIsInWorkArea(inArea);
    setCurrentWorkLocation(inArea ? nearestWorkLocation : null);
    
    if (onLocationChange) {
      onLocationChange(inArea, inArea ? nearestWorkLocation : undefined);
    }
  };

  if (location.loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Getting location...</span>
      </div>
    );
  }

  if (location.error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="w-5 h-5" />
        <span>Location access denied</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isInWorkArea ? 'bg-green-50' : 'bg-yellow-50'}`}>
          {isInWorkArea ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <MapPin className="w-5 h-5 text-yellow-600" />
          )}
        </div>
        <div>
          <p className={`font-medium ${isInWorkArea ? 'text-green-700' : 'text-yellow-700'}`}>
            {isInWorkArea ? 'In Work Area' : 'Outside Work Area'}
          </p>
          <p className="text-sm text-gray-600">
            {currentWorkLocation ? currentWorkLocation.name : 'No work location nearby'}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-gray-500" />
            <span className="font-medium">Location Details</span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={async () => {
                if (location.latitude && location.longitude) {
                  await supabase.from('work_locations').insert({
                    name: 'Test Location',
                    address: 'Current Position',
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radius: 200,
                    is_active: true
                  });
                  loadWorkLocations();
                }
              }}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              title="Add work location here"
            >
              + Add Here
            </button>
            <button
              onClick={() => {
                setIsInWorkArea(!isInWorkArea);
                if (onLocationChange) {
                  onLocationChange(!isInWorkArea, workLocations[0]);
                }
              }}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              title="Toggle work area status"
            >
              Toggle
            </button>
            <button
              onClick={() => {
                loadWorkLocations();
                if (location.latitude && location.longitude) {
                  checkGeofence();
                }
              }}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh location data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="space-y-1 text-gray-600">
          <p>Latitude: {location.latitude?.toFixed(6) || 'Not available'}</p>
          <p>Longitude: {location.longitude?.toFixed(6) || 'Not available'}</p>
          <p>Accuracy: {location.accuracy ? `${Math.round(location.accuracy)}m` : 'Unknown'}</p>
          <p>Work Locations: {workLocations.length} found</p>
          {currentWorkLocation && (
            <p>Current: {currentWorkLocation.name} (Radius: {currentWorkLocation.radius}m)</p>
          )}
        </div>
      </div>
    </div>
  );
}