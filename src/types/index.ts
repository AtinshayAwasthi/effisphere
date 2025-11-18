export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  workSchedule: string;
  manager: string;
  emergencyContact: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  timestamp?: Date;
}

export interface WorkLocation {
  id: number;
  name: string;
  address: string;
  coordinates: Location;
  radius: number; // in meters
  type: 'office' | 'branch' | 'remote' | 'field';
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  date: string;
  checkIn?: {
    time: Date;
    location: Location;
    method: 'automatic' | 'manual';
    accuracy: number;
  };
  checkOut?: {
    time: Date;
    location: Location;
    method: 'automatic' | 'manual';
    accuracy: number;
  };
  totalHours: number;
  breakTime: number;
  status: 'present' | 'absent' | 'late' | 'partial';
  workLocation: WorkLocation;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: number;
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  timeSpent: number; // in minutes
  estimatedTime: number; // in minutes
}

export interface ProductivityMetrics {
  employeeId: number;
  date: string;
  totalWorkingHours: number;
  activeTime: number;
  idleTime: number;
  tasksCompleted: number;
  tasksAssigned: number;
  productivityScore: number;
  punctualityScore: number;
  efficiencyRating: number;
}

export interface GeofenceEvent {
  id: number;
  employeeId: number;
  type: 'entry' | 'exit';
  location: Location;
  workLocationId: number;
  timestamp: Date;
  accuracy: number;
  method: 'geofence' | 'manual';
}