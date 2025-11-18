import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AttendanceRecord, Location } from '../types';

interface AttendanceStore {
  attendanceRecords: AttendanceRecord[];
  currentSession: {
    isActive: boolean;
    checkInTime: Date | null;
    checkInLocation: Location | null;
    workLocationId: number | null;
  };
  
  // Actions
  checkIn: (location: Location, workLocationId: number, method: 'automatic' | 'manual') => void;
  checkOut: (location: Location, method: 'automatic' | 'manual') => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (id: number, updates: Partial<AttendanceRecord>) => void;
  getAttendanceByDate: (date: string) => AttendanceRecord | null;
  getAttendanceByEmployee: (employeeId: number) => AttendanceRecord[];
  getAttendanceStats: (employeeId: number, startDate: string, endDate: string) => {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalHours: number;
    averageHours: number;
    punctualityScore: number;
  };
}

export const useAttendanceStore = create<AttendanceStore>()(
  persist(
    (set, get) => ({
      attendanceRecords: [],
      currentSession: {
        isActive: false,
        checkInTime: null,
        checkInLocation: null,
        workLocationId: null
      },

      checkIn: (location, workLocationId, method) => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        set(state => ({
          currentSession: {
            isActive: true,
            checkInTime: now,
            checkInLocation: location,
            workLocationId
          }
        }));

        // Create or update today's attendance record
        const existingRecord = get().getAttendanceByDate(today);
        if (existingRecord) {
          get().updateAttendanceRecord(existingRecord.id, {
            checkIn: {
              time: now,
              location,
              method,
              accuracy: location.accuracy || 10
            }
          });
        } else {
          const newRecord: AttendanceRecord = {
            id: Date.now(),
            employeeId: 1, // Current user
            date: today,
            checkIn: {
              time: now,
              location,
              method,
              accuracy: location.accuracy || 10
            },
            totalHours: 0,
            breakTime: 0,
            status: 'present',
            workLocation: {
              id: workLocationId,
              name: 'Work Location',
              address: 'Current Location',
              coordinates: location,
              radius: 200,
              type: 'office'
            }
          };
          get().addAttendanceRecord(newRecord);
        }
      },

      checkOut: (location, method) => {
        const { currentSession } = get();
        if (!currentSession.isActive || !currentSession.checkInTime) return;

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const totalHours = (now.getTime() - currentSession.checkInTime.getTime()) / (1000 * 60 * 60);

        set(state => ({
          currentSession: {
            isActive: false,
            checkInTime: null,
            checkInLocation: null,
            workLocationId: null
          }
        }));

        const existingRecord = get().getAttendanceByDate(today);
        if (existingRecord) {
          get().updateAttendanceRecord(existingRecord.id, {
            checkOut: {
              time: now,
              location,
              method,
              accuracy: location.accuracy || 10
            },
            totalHours: Math.round(totalHours * 100) / 100
          });
        }
      },

      addAttendanceRecord: (record) => {
        set(state => ({
          attendanceRecords: [...state.attendanceRecords, record]
        }));
      },

      updateAttendanceRecord: (id, updates) => {
        set(state => ({
          attendanceRecords: state.attendanceRecords.map(record =>
            record.id === id ? { ...record, ...updates } : record
          )
        }));
      },

      getAttendanceByDate: (date) => {
        const { attendanceRecords } = get();
        return attendanceRecords.find(record => record.date === date) || null;
      },

      getAttendanceByEmployee: (employeeId) => {
        const { attendanceRecords } = get();
        return attendanceRecords.filter(record => record.employeeId === employeeId);
      },

      getAttendanceStats: (employeeId, startDate, endDate) => {
        const records = get().getAttendanceByEmployee(employeeId)
          .filter(record => record.date >= startDate && record.date <= endDate);

        const totalDays = records.length;
        const presentDays = records.filter(r => r.status === 'present').length;
        const absentDays = records.filter(r => r.status === 'absent').length;
        const lateDays = records.filter(r => r.status === 'late').length;
        const totalHours = records.reduce((sum, r) => sum + r.totalHours, 0);
        const averageHours = totalDays > 0 ? totalHours / totalDays : 0;
        const punctualityScore = totalDays > 0 ? ((presentDays - lateDays) / totalDays) * 100 : 0;

        return {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          totalHours,
          averageHours,
          punctualityScore
        };
      }
    }),
    {
      name: 'attendance-store',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          
          // Convert date strings back to Date objects
          if (data.state.currentSession?.checkInTime) {
            data.state.currentSession.checkInTime = new Date(data.state.currentSession.checkInTime);
          }
          
          data.state.attendanceRecords = data.state.attendanceRecords.map((record: any) => ({
            ...record,
            checkIn: record.checkIn ? {
              ...record.checkIn,
              time: new Date(record.checkIn.time)
            } : undefined,
            checkOut: record.checkOut ? {
              ...record.checkOut,
              time: new Date(record.checkOut.time)
            } : undefined
          }));
          
          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);