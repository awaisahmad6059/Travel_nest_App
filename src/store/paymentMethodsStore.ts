import { create } from "zustand";
import type { PaymentMethod } from "@/types";
import { loadLocalJSON, saveLocalJSON } from "./localPersistence";

/**
 * Local saved payment methods (demo). No backend module exists yet, so these
 * are seeded with the same methods checkout used to hardcode and can be
 * added/removed locally. `paymentApi.getPaymentMethods()` reads from here, so
 * changes made on the Profile -> Payment methods screen show up at checkout.
 */

const KEY = "paymentMethods.v1";

const SEED: PaymentMethod[] = [
  { id: "pm_1", type: "card", label: "Visa •••• 4242", detail: "Exp 08/28" },
  { id: "pm_2", type: "card", label: "Mastercard •••• 1881", detail: "Exp 11/27" },
  { id: "pm_3", type: "wallet", label: "Apple Pay", detail: "Saved wallet" },
];

interface PaymentMethodsState {
  cards: PaymentMethod[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addCard: (card: PaymentMethod) => void;
  removeCard: (id: string) => void;
}

export const usePaymentMethodsStore = create<PaymentMethodsState>((set, get) => ({
  cards: SEED,
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    const saved = await loadLocalJSON<PaymentMethod[]>(KEY);
    if (Array.isArray(saved) && saved.length > 0) set({ cards: saved });
    set({ hydrated: true });
  },

  addCard(card) {
    set((s) => ({ cards: [...s.cards, card] }));
  },

  removeCard(id) {
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }));
  },
}));

void usePaymentMethodsStore.getState().hydrate();
usePaymentMethodsStore.subscribe((s) => {
  void saveLocalJSON(KEY, s.cards);
});
