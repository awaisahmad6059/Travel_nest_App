import { create } from "zustand";
import type { Thumbnail } from "@/types";

/** The single experience being booked (replaces the multi-line cart). */
export interface BookingDraft {
  listingId: string;
  listingTitle: string;
  thumbnail: Thumbnail;
  /** Real image url when available — same data the listing card shows. */
  imageUrl?: string;
  optionId: string;
  optionName: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  /** ISO date of the activity (slot start_time when a real slot was picked). */
  date: string;
  /** Inventory slot id (API_HANDOFF.md §4.2) — required by the real backend hold. */
  slotId?: string;
  freeCancellation: boolean;
  instantConfirmation: boolean;
}

interface BookingDraftState {
  draft: BookingDraft | null;
  setDraft: (draft: BookingDraft) => void;
  clearDraft: () => void;
}

export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));

/** Convenience selector for the single booking draft used across checkout. */
export function useBookingDraft() {
  const draft = useBookingDraftStore((s) => s.draft);
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const clearDraft = useBookingDraftStore((s) => s.clearDraft);
  return { draft, setDraft, clearDraft };
}
