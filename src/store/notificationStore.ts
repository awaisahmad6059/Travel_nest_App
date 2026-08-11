import { create } from "zustand";
import { useBookingDraftStore } from "./bookingDraftStore";
import { useCheckoutStore } from "./checkoutStore";

/**
 * Local, event-driven notifications (API_HANDOFF.md §5.4 mobile module is not
 * built yet, so no push backend — this is a client-side feed).
 *
 * Events are wired at module load by subscribing to the booking draft and
 * checkout stores:
 *   - booking draft set  -> "Booking ready" (Book Now tapped)
 *   - inventory hold     -> "Spot reserved" + scheduled "Hold expiring soon"
 *   - checkout success   -> "Booking confirmed" (the payment flow clears holds)
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

/**
 * Starts listening to booking/checkout events and turns them into notifications.
 * Idempotent — safe to call from multiple places.
 */
export function initNotifications(): void {
  if (wired) return;
  wired = true;

  useBookingDraftStore.subscribe((state, prev) => {
    if (!state.draft || prev.draft === state.draft) return;
    useNotificationStore.getState().add({
      kind: "cart",
      title: "Booking ready",
      body: `${state.draft.listingTitle} is ready for checkout.`,
    });
  });

  useCheckoutStore.subscribe((state, prev) => {
    const prevHold = prev.hold;
    const hold = state.hold;

    // Booking confirmed — the payment flow clears the hold on success.
    if (prevHold && !hold) {
      useNotificationStore.getState().add({
        kind: "booking",
        title: "Booking confirmed",
        body: "Payment successful — your voucher is ready under Bookings.",
      });
    }

    // New inventory hold — reserve notice + a scheduled "expiring soon" nudge.
    if (!prevHold && hold) {
      useNotificationStore.getState().add({
        kind: "hold",
        title: "Spot reserved",
        body: "Your slot is held for 15 minutes. Complete payment to lock it in.",
      });
      const delay = Math.max(1000, hold.expiresAt - HOLD_WARN_MS - Date.now());
      setTimeout(() => {
        const current = useCheckoutStore.getState().hold;
        if (!current || holdWarningsFired.has(hold.holdId)) return;
        holdWarningsFired.add(hold.holdId);
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
