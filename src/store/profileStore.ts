import { create } from "zustand";
import { loadLocalJSON, saveLocalJSON } from "./localPersistence";

/**
 * Local profile edits (display name + avatar). The display name persists via
 * secure-store; the avatar uri persists too but points at a temp/cache file so
 * it is only guaranteed for the current session.
 */

const KEY = "profile.v1";

interface ProfileState {
  displayName: string | null;
  avatarUri: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setDisplayName: (name: string) => void;
  setAvatarUri: (uri: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  displayName: null,
  avatarUri: null,
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    const saved = await loadLocalJSON<{ displayName?: string | null; avatarUri?: string | null }>(
      KEY,
    );
    if (saved) {
      set({
        displayName: typeof saved.displayName === "string" ? saved.displayName : null,
        avatarUri: typeof saved.avatarUri === "string" ? saved.avatarUri : null,
      });
    }
    set({ hydrated: true });
  },

  setDisplayName: (displayName) => set({ displayName }),
  setAvatarUri: (avatarUri) => set({ avatarUri }),
}));

void useProfileStore.getState().hydrate();
useProfileStore.subscribe((s) => {
  void saveLocalJSON(KEY, { displayName: s.displayName, avatarUri: s.avatarUri });
});
