import { create } from "zustand";
import { useCartStore } from "./cartStore";
import { useCheckoutStore } from "./checkoutStore";

/**
 * Local, event-driven notifications (API_HANDOFF.md §5.4 mobile module is not
 * built yet, so no push backend — this is a client-side feed).
 *
 * Events are wired at module load by subscribing to the existing cart and
 * checkout stores (no changes to those files were needed):
 *   - cart item added  -> "Added to cart"
 *   - inventory hold   -> "Spot reserved" + scheduled "Hold expiring soon"
 *   - checkout success -> "Booking confirmed" (the payment flow clears holds)
 */

export type NotificationKind = "cart" | "booking" | "hold" | "info";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

interface NotificationState {
  items: AppNotification[];
  add: (input: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeAll: () => void;
}

let counter = 0;
function newId(): string {
  counter += 1;
  return `notif_${Date.now()}_${counter}`;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],

  add(input) {
    set((state) => ({
      items: [{ ...input, id: newId(), createdAt: Date.now(), read: false }, ...state.items],
    }));
  },

  markRead(id) {
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  markAllRead() {
    set((state) => ({ items: state.items.map((n) => ({ ...n, read: true })) }));
  },

  removeAll() {
    set({ items: [] });
  },
}));

/** Convenience selector returning the feed plus an unread count for badges. */
export function useNotifications() {
  const items = useNotificationStore((s) => s.items);
  const add = useNotificationStore((s) => s.add);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const removeAll = useNotificationStore((s) => s.removeAll);
  const unreadCount = items.filter((n) => !n.read).length;
  return { items, unreadCount, add, markRead, markAllRead, removeAll };
}

const HOLD_WARN_MS = 5 * 60 * 1000;
const holdWarningsFired = new Set<string>();
let wired = false;

function lineCount(lines: { quantity: number }[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

/**
 * Starts listening to cart/checkout events and turns them into notifications.
 * Idempotent — safe to call from multiple places.
 */
export function initNotifications(): void {
  if (wired) return;
  wired = true;

  useCartStore.subscribe((state, prev) => {
    const count = lineCount(state.lines);
    const prevCount = lineCount(prev.lines);
    if (count <= prevCount) return;
    const last = state.lines[state.lines.length - 1];
    useNotificationStore.getState().add({
      kind: "cart",
      title: "Added to cart",
      body: last
        ? `${last.listingTitle} is now in your cart.`
        : "An item was added to your cart.",
    });
  });

  useCheckoutStore.subscribe((state, prev) => {
    const prevHoldKeys = Object.keys(prev.holds);
    const holdKeys = Object.keys(state.holds);

    // Booking confirmed — the payment flow clears all holds on success.
    if (prevHoldKeys.length > 0 && holdKeys.length === 0) {
      useNotificationStore.getState().add({
        kind: "booking",
        title: "Booking confirmed",
        body: "Payment successful — your voucher is ready under Bookings.",
      });
    }

    // New inventory hold — reserve notice + a scheduled "expiring soon" nudge.
    for (const key of holdKeys) {
      if (prev.holds[key]) continue;
      const hold = state.holds[key];
      useNotificationStore.getState().add({
        kind: "hold",
        title: "Spot reserved",
        body: "Your slot is held for 15 minutes. Complete payment to lock it in.",
      });
      const delay = Math.max(1000, hold.expiresAt - HOLD_WARN_MS - Date.now());
      setTimeout(() => {
        const current = useCheckoutStore.getState().holds[key];
        if (!current || holdWarningsFired.has(key)) return;
        holdWarningsFired.add(key);
        useNotificationStore.getState().add({
          kind: "hold",
          title: "Hold expiring soon",
          body: "Your reservation expires in 5 minutes. Head to payment to keep your slot.",
        });
      }, delay);
    }
  });
}

// Wire the listeners as soon as this module loads.
initNotifications();
