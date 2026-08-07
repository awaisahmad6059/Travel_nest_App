import { create } from "zustand";
import type { Traveler } from "@/types";

interface CheckoutState {
  travelers: Traveler[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  setTravelers: (travelers: Traveler[]) => void;
  setContact: (input: { name: string; email: string; phone: string }) => void;
  setLocations: (pickup: string, dropoff: string) => void;
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
  setTravelers: (travelers) => set({ travelers }),
  setContact: ({ name, email, phone }) =>
    set({ contactName: name, contactEmail: email, contactPhone: phone }),
  setLocations: (pickupLocation, dropoffLocation) => set({ pickupLocation, dropoffLocation }),
  reset: () =>
    set({
      travelers: [],
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      pickupLocation: "",
      dropoffLocation: "",
    }),
}));
