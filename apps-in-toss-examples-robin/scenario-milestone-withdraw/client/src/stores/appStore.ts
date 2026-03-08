import { create } from 'zustand';

interface EventLogEntry {
  timestamp: number;
  type: string;
  data?: unknown;
}

interface AppStore {
  // Event log
  events: EventLogEntry[];
  addEvent: (type: string, data?: unknown) => void;
  clearEvents: () => void;

  // User (demo)
  userId: string;
}

export const useAppStore = create<AppStore>((set) => ({
  events: [],
  addEvent: (type, data) =>
    set((s) => ({
      events: [{ timestamp: Date.now(), type, data }, ...s.events].slice(0, 50),
    })),
  clearEvents: () => set({ events: [] }),

  userId: 'demo-user-1',
}));
