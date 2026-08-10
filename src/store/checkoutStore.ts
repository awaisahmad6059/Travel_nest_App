import { create } from "zustand";
import type { Traveler } from "@/types";

/** Inventory hold (API_HANDOFF.md §4.2) for one cart line, keyed by listingId::optionId. */
export interface LineHold {
  holdId: string;
  expiresAt: number;
}

export function lineKey(listingId: string, optionId: string): string {
  return `${listingId}::${optionId}`;
}

interface CheckoutState {
  travelers: Traveler[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  holds: Record<string, LineHold>;
  setTravelers: (travelers: Traveler[]) => void;
  setContact: (input: { name: string; email: string; phone: string }) => void;
  setLocations: (pickup: string, dropoff: string) => void;
  setHold: (key: string, hold: LineHold) => void;
  clearHolds: () => void;
  reset: () => void;
}

/** Temporary holder for traveler/contact/location details across the checkout flow. */
export const useCheckoutStore = create<CheckoutState>((set) => ({
  travelers: [],
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  pickupLocation: "",
  dropoffLocation: "",
  holds: {},
  setTravelers: (travelers) => set({ travelers }),
  setContact: ({ name, email, phone }) =>
    set({ contactName: name, contactEmail: email, contactPhone: phone }),
  setLocations: (pickupLocation, dropoffLocation) => set({ pickupLocation, dropoffLocation }),
  setHold: (key, hold) => set((s) => ({ holds: { ...s.holds, [key]: hold } })),
  clearHolds: () => set({ holds: {} }),
  reset: () =>
    set({
      travelers: [],
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      pickupLocation: "",
      dropoffLocation: "",
      holds: {},
    }),
}));
