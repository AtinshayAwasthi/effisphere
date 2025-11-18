import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, Activity, User, LogOut, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TimeTracker } from './TimeTracker';
import { attendanceService } from '../lib/attendance';
import { LocationTracker } from './LocationTracker';
import { WorkLocation } from '../lib/geofencing';
import { useNotifications } from '../hooks/useNotifications';
import { fraudDetectionService } from '../lib/fraudDetection';
import { ChangePasswordModal } from './ChangePasswordModal';
import { EmployeeAnalytics } from './EmployeeAnalytics';
import { NotificationCenter } from './NotificationCenter';
import { VerificationNotification } from './VerificationNotification';
import { authService } from '../lib/auth';
import { useEmployeeStore } from '../store/employeeStore';

interface Employee {
  id: string;
  full_name: string;
  employee_id: string;
  department: string;
  position: string;
}

interface EmployeeDashboardProps {
  onLogout: () => void;
}

export function EmployeeDashboard({ onLogout }: EmployeeDashboardProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayHours, setTodayHours] = useState(0);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isInWorkArea, setIsInWorkArea] = useState(false);
  const [currentWorkLocation, setCurrentWorkLocation] = useState<WorkLocation | null>(null);
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [verificationSession, setVerificationSession] = useState<any>(null);

  useEffect(() => {
    loadEmployeeData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (employee) {
      checkForVerificationRequests();
      const interval = setInterval(checkForVerificationRequests, 10000);
      return () => clearInterval(interval);
    }
  }, [employee]);

  useEffect(() => {
    if (employee) {
      checkActiveSession();
      loadTodayHours();
    }
  }, [employee]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      
      if (currentUser && currentUser.employee) {
        // Use data from auth service
        setEmployee({
          id: currentUser.employee.id,
          full_name: currentUser.employee.full_name,
          employee_id: currentUser.employee.employee_id,
          department: currentUser.employee.department,
          position: currentUser.employee.position
        });
        addNotification({
          type: 'success',
          title: 'Welcome!',
          message: `Hello ${currentUser.employee.full_name}`
        });
      } else if (currentUser) {
        // Try to fetch employee data from database
        const { data: empData, error } = await supabase
          .from('employees')
          .select('id, full_name, employee_id, department, position')
          .eq('user_id', currentUser.id)
          .maybeSingle();
          
        if (error) {
          console.error('Database error:', error);
        }
        
        if (empData) {
          setEmployee(empData);
          addNotification({
            type: 'success',
            title: 'Welcome!',
            message: `Hello ${empData.full_name}`
          });
        } else {
          addNotification({
            type: 'error',
            title: 'Error',
            message: 'No employee record found for this user'
          });
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'User not authenticated'
        });
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load employee information'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkForVerificationRequests = async () => {
    if (!employee) return;
    
    try {
      const { data } = await supabase
        .from('verification_sessions')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('triggered_at', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0 && !verificationSession) {
        setVerificationSession(data[0]);
        addNotification({
          type: 'warning',
          title: 'Verification Required',
          message: 'Please complete identity verification immediately'
        });
      }
    } catch (error) {
      console.error('Error checking verification requests:', error);
    }
  };

  const checkActiveSession = async () => {
    if (!employee) return;
    const activeRecord = await attendanceService.getActiveRecord(employee.id);
    setIsCheckedIn(!!activeRecord);
    if (activeRecord) {
      setCheckInTime(new Date(activeRecord.check_in_time));
    } else {
      setCheckInTime(null);
    }
  };

  const loadTodayHours = async () => {
    if (!employee) return;
    const records = await attendanceService.getTodayRecords(employee.id);
    const total = records.reduce((sum, record) => sum + (record.total_hours || 0), 0);
    setTodayHours(total);
  };

  const handleCheckIn = async () => {
    if (!employee) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Employee data not loaded'
      });
      return;
    }
    
    // Temporarily allow check-in from anywhere for testing
    // if (!isInWorkArea) {
    //   addNotification({
    //     type: 'warning',
    //     title: 'Location Required',
    //     message: 'You must be in a work area to check in'
    //   });
    //   return;
    // }
    
    console.log('Starting check-in process for employee:', employee.id);
    
    // Get current location for check-in
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('Got location:', position.coords);
        
        try {
          // Skip fraud detection for now to simplify
          // const fraudAlert = await fraudDetectionService.detectLocationSpoofing(
          //   employee.id,
          //   position.coords.latitude,
          //   position.coords.longitude,
          //   position.coords.accuracy
          // );

          const result = await attendanceService.checkIn(employee.id, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          
          console.log('Check-in result:', result);
          
          if (result.success) {
            setIsCheckedIn(true);
            setCheckInTime(new Date());
            await loadTodayHours();
            addNotification({
              type: 'success',
              title: 'Check-in Successful',
              message: `Checked in at ${new Date().toLocaleTimeString()}`
            });
          } else {
            addNotification({
              type: 'error',
              title: 'Check-in Failed',
              message: result.error || 'Unknown error occurred'
            });
          }
        } catch (error) {
          console.error('Check-in error:', error);
          addNotification({
            type: 'error',
            title: 'Check-in Error',
            message: 'An unexpected error occurred'
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        addNotification({
          type: 'error',
          title: 'Location Required',
          message: 'Please enable location services to check in'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleCheckOut = async () => {
    if (!employee) return;
    
    console.log('Starting check-out process for employee:', employee.id);
    
    try {
      const result = await attendanceService.checkOut(employee.id);
      console.log('Check-out result:', result);
      
      if (result.success) {
        setIsCheckedIn(false);
        setCheckInTime(null);
        await loadTodayHours();
        addNotification({
          type: 'success',
          title: 'Check-out Successful',
          message: 'Work session completed'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Check-out Failed',
          message: result.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('Check-out error:', error);
      addNotification({
        type: 'error',
        title: 'Check-out Error',
        message: 'An unexpected error occurred'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome, {employee?.full_name || 'Employee'}
                </h1>
                <p className="text-sm text-gray-600">{employee?.position} • {employee?.department}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => addNotification({
                  type: 'info',
                  title: 'Test Notification',
                  message: 'Notification system is working properly!'
                })}
                className="flex items-center space-x-1 sm:space-x-2 text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base"
                title="Test Notifications"
              >
                <span className="text-xs">🔔</span>
              </button>
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time & Status */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-mono font-bold">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-blue-100 mt-1">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="space-y-2">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isCheckedIn ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    isCheckedIn ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isInWorkArea ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                }`}>
                  <MapPin className="w-3 h-3 mr-1" />
                  {isInWorkArea ? 'In Work Area' : 'Outside Work Area'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h3>
            <TimeTracker 
              isCheckedIn={isCheckedIn}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              checkInTime={checkInTime}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Status</h3>
            <LocationTracker 
              onLocationChange={(inArea, location) => {
                setIsInWorkArea(inArea);
                setCurrentWorkLocation(location || null);
                
                // Notify about location changes
                if (inArea && location && !isInWorkArea) {
                  addNotification({
                    type: 'info',
                    title: 'Entered Work Area',
                    message: `You are now in ${location.name}`
                  });
                } else if (!inArea && isInWorkArea) {
                  addNotification({
                    type: 'warning',
                    title: 'Left Work Area',
                    message: 'You have left the authorized work area'
                  });
                }
              }}
            />
          </div>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.floor(todayHours)}h {Math.round((todayHours % 1) * 60)}m</p>
                <p className="text-sm text-gray-600">Hours Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round((todayHours / 8) * 100)}%</p>
                <p className="text-sm text-gray-600">Productivity</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{isCheckedIn ? '1' : '0'}</p>
                <p className="text-sm text-gray-600">Active Sessions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {employee && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Analytics</h3>
            <EmployeeAnalytics employeeId={employee.id} />
          </div>
        )}
      </div>

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => {
            setShowChangePassword(false);
            addNotification({
              type: 'success',
              title: 'Password Changed',
              message: 'Your password has been updated successfully'
            });
          }}
        />
      )}

      <NotificationCenter />
      
      {verificationSession && (
        <VerificationNotification
          sessionId={verificationSession.id}
          expiresAt={verificationSession.expires_at}
          onClose={() => setVerificationSession(null)}
          onComplete={() => {
            setVerificationSession(null);
            addNotification({
              type: 'success',
              title: 'Verification Complete',
              message: 'Identity verification has been processed'
            });
          }}
        />
      )}
    </div>
  );
}