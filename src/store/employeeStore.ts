import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
}

interface Location {
  lat: number;
  lng: number;
}

interface EmployeeStore {
  currentUser: Employee | null;
  userRole: string | null;
  isWorking: boolean;
  workStart: Date | null;
  workEnd: Date | null;
  totalHours: string;
  currentLocation: Location | null;
  
  setCurrentUser: (user: Employee) => void;
  setUserRole: (role: string) => void;
  startWork: (location: Location) => void;
  endWork: () => void;
  pauseWork: () => void;
  resumeWork: () => void;
  updateLocation: (location: Location) => void;
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      userRole: null,
      isWorking: false,
      workStart: null,
      workEnd: null,
      totalHours: '0:00:00',
      currentLocation: null,

      setCurrentUser: (user) => set({ currentUser: user }),
      setUserRole: (role) => set({ userRole: role }),

      startWork: (location) => {
        const now = new Date();
        set({
          isWorking: true,
          workStart: now,
          workEnd: null,
          currentLocation: location
        });
      },

      endWork: () => {
        const state = get();
        const now = new Date();
        
        if (state.workStart) {
          const diff = now.getTime() - state.workStart.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          const totalHours = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          set({
            isWorking: false,
            workEnd: now,
            totalHours
          });
        }
      },

      pauseWork: () => {
        set({ isWorking: false });
      },

      resumeWork: () => {
        set({ isWorking: true });
      },

      updateLocation: (location) => {
        set({ currentLocation: location });
      },
    }),
    {
      name: 'employee-store',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          // Convert date strings back to Date objects
          if (data.state.workStart) {
            data.state.workStart = new Date(data.state.workStart);
          }
          if (data.state.workEnd) {
            data.state.workEnd = new Date(data.state.workEnd);
          }
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