import { create } from 'zustand';
import { Location } from '../types';

interface LocationStore {
  currentLocation: Location | null;
  isLocationEnabled: boolean;

  setCurrentLocation: (location: Location) => void;
  setLocationEnabled: (enabled: boolean) => void;
}

export const useLocationStore = create<LocationStore>()((set) => ({
  currentLocation: null,
  isLocationEnabled: false,

  setCurrentLocation: (location) => {
    set({ currentLocation: location });
  },

  setLocationEnabled: (enabled) => {
    set({ isLocationEnabled: enabled });
  }
}));
