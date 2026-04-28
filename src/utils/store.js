import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  incidents: [],
  setIncidents: (incidents) => set({ incidents }),

  facilities: [],
  setFacilities: (facilities) => set({ facilities }),

  selectedFacility: null,
  setSelectedFacility: (facility) => set({ selectedFacility: facility }),

  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    })),

  responders: [],
  setResponders: (responders) => set({ responders }),

  currentDrill: null,
  setCurrentDrill: (drill) => set({ currentDrill: drill }),

  clearUser: () => set({ user: null }),
}));
