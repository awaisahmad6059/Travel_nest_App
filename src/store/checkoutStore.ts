import { create } from "zustand";
import type { Traveler } from "@/types";

/** Inventory hold (API_HANDOFF.md §4.2) for the single booking being checked out. */
export interface LineHold {
  holdId: string;
  expiresAt: number;
}

interface CheckoutState {
  travelers: Traveler[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  hold: LineHold | null;
  setTravelers: (travelers: Traveler[]) => void;
  setContact: (input: { name: string; email: string; phone: string }) => void;
  setLocations: (pickup: string, dropoff: string) => void;
  setHold: (hold: LineHold) => void;
  clearHold: () => void;
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
  hold: null,
  setTravelers: (travelers) => set({ travelers }),
  setContact: ({ name, email, phone }) =>
    set({ contactName: name, contactEmail: email, contactPhone: phone }),
  setLocations: (pickupLocation, dropoffLocation) => set({ pickupLocation, dropoffLocation }),
  setHold: (hold) => set({ hold }),
  clearHold: () => set({ hold: null }),
  reset: () =>
    set({
      travelers: [],
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      pickupLocation: "",
      dropoffLocation: "",
      hold: null,
    }),
}));
