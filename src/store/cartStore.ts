import { create } from "zustand";
import type { Coupon } from "@/types";

export interface CartLine {
  listingId: string;
  listingTitle: string;
  thumbnailKey: string;
  optionId: string;
  optionName: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  date: string;
  freeCancellation: boolean;
  instantConfirmation: boolean;
}

interface CartState {
  lines: CartLine[];
  coupon: Coupon | null;
  addLine: (line: CartLine) => void;
  updateQuantity: (listingId: string, optionId: string, quantity: number) => void;
  removeLine: (listingId: string, optionId: string) => void;
  applyCoupon: (coupon: Coupon | null) => void;
  clear: () => void;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  coupon: null,

  addLine(line) {
    set((state) => {
      const existing = state.lines.find(
        (l) => l.listingId === line.listingId && l.optionId === line.optionId,
      );
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l === existing ? { ...l, quantity: l.quantity + line.quantity } : l,
          ),
        };
      }
      return { lines: [...state.lines, line] };
    });
  },

  updateQuantity(listingId, optionId, quantity) {
    set((state) => ({
      lines: state.lines
        .map((l) =>
          l.listingId === listingId && l.optionId === optionId
            ? { ...l, quantity: Math.max(1, quantity) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    }));
  },

  removeLine(listingId, optionId) {
    set((state) => ({
      lines: state.lines.filter(
        (l) => !(l.listingId === listingId && l.optionId === optionId),
      ),
    }));
  },

  applyCoupon(coupon) {
    set({ coupon });
  },

  clear() {
    set({ lines: [], coupon: null });
  },

  subtotal() {
    return get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  },
}));

/** Convenience selector returning cart value helpers for screens. */
export function useCart() {
  const lines = useCartStore((s) => s.lines);
  const coupon = useCartStore((s) => s.coupon);
  const addLine = useCartStore((s) => s.addLine);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore((s) => s.subtotal);
  return {
    lines,
    coupon,
    addLine,
    updateQuantity,
    removeLine,
    applyCoupon,
    clear,
    subtotal: subtotal(),
    count: lines.reduce((n, l) => n + l.quantity, 0),
  };
}
