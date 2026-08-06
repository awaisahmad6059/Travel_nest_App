import { create } from "zustand";
import type { Traveler } from "@/types";

interface CheckoutState {
  travelers: Traveler[];
  contactEmail: string;
  contactPhone: string;
  setTravelers: (travelers: Traveler[]) => void;
  setContact: (email: string, phone: string) => void;
  reset: () => void;
}

/** Temporary holder for traveler details across the checkout flow. */
export const useCheckoutStore = create<CheckoutState>((set) => ({
  travelers: [],
  contactEmail: "",
  contactPhone: "",
  setTravelers: (travelers) => set({ travelers }),
  setContact: (contactEmail, contactPhone) => set({ contactEmail, contactPhone }),
  reset: () => set({ travelers: [], contactEmail: "", contactPhone: "" }),
}));
