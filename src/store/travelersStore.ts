import { create } from "zustand";
import { loadLocalJSON, saveLocalJSON } from "./localPersistence";

/**
 * Local saved travellers (demo). Used by the Profile -> Saved travellers
 * screen; can be added/edited/deleted locally.
 */

export type TravelerType = "Adult" | "Child" | "Infant" | "Senior";

export interface SavedTraveler {
  id: string;
  name: string;
  age?: string;
  type: TravelerType;
}

const KEY = "travelers.v1";

const SEED: SavedTraveler[] = [
  { id: "tr_1", name: "Awais Ahmad", age: "28", type: "Adult" },
  { id: "tr_2", name: "Sara Khan", age: "24", type: "Adult" },
];

interface TravelersState {
  travelers: SavedTraveler[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (input: Omit<SavedTraveler, "id">) => void;
  update: (id: string, input: Omit<SavedTraveler, "id">) => void;
  remove: (id: string) => void;
}

export const useTravelersStore = create<TravelersState>((set, get) => ({
  travelers: SEED,
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    const saved = await loadLocalJSON<SavedTraveler[]>(KEY);
    if (Array.isArray(saved) && saved.length > 0) set({ travelers: saved });
    set({ hydrated: true });
  },

  add(input) {
    set((s) => ({
      travelers: [...s.travelers, { ...input, id: `tr_${Date.now()}` }],
    }));
  },

  update(id, input) {
    set((s) => ({
      travelers: s.travelers.map((t) => (t.id === id ? { ...t, ...input } : t)),
    }));
  },

  remove(id) {
    set((s) => ({ travelers: s.travelers.filter((t) => t.id !== id) }));
  },
}));

void useTravelersStore.getState().hydrate();
useTravelersStore.subscribe((s) => {
  void saveLocalJSON(KEY, s.travelers);
});
