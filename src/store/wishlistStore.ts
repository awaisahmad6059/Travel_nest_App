import { create } from "zustand";

interface WishlistState {
  ids: string[];
  toggle: (id: string) => void;
  isSaved: (id: string) => boolean;
}

/**
 * Wishlist is a lightweight client store for now. When the real API arrives it
 * will sync with the backend Wishlist module — the store boundary keeps that
 * swap isolated to this file.
 */
export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: ["lst_002", "lst_011"],

  toggle(id) {
    set((state) => ({
      ids: state.ids.includes(id)
        ? state.ids.filter((x) => x !== id)
        : [...state.ids, id],
    }));
  },

  isSaved(id) {
    return get().ids.includes(id);
  },
}));

export function useWishlist() {
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const isSaved = useWishlistStore((s) => s.isSaved);
  return { ids, toggle, isSaved };
}
