import { create } from 'zustand';

interface EventLogEntry {
  timestamp: number;
  type: string;
  data?: unknown;
}

interface EventLogStore {
  events: EventLogEntry[];
  addEvent: (type: string, data?: unknown) => void;
  clear: () => void;
}

export const useEventLogStore = create<EventLogStore>((set) => ({
  events: [],
  addEvent: (type, data) =>
    set((s) => ({
      events: [{ timestamp: Date.now(), type, data }, ...s.events].slice(0, 50),
    })),
  clear: () => set({ events: [] }),
}));
