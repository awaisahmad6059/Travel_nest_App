import * as SecureStore from "expo-secure-store";
import type { BookingStatus, Thumbnail, Traveler } from "@/types";

/**
 * Offline voucher cache (API_HANDOFF.md §4.3).
 *
 * After a successful checkout we cache `booking_reference`, `qr_voucher_code`
 * and the traveler/slot fields locally so "My Bookings" renders vouchers with
 * no network connection (SRS requirement). The real My-Bookings list endpoint
 * is not built yet (§5.2), so this cache doubles as the online list source for
 * bookings created from the app.
 *
 * Storage: expo-secure-store. Each voucher lives under its own key
 * (`travelnest.voucher.<id>`) plus a small index key of ids, because iOS
 * Keychain values are limited (≈2KB) — one JSON blob of all vouchers could
 * overflow that limit. Falls back to an empty cache when SecureStore is
 * unavailable (e.g. web / Expo Go on some platforms).
 */

const INDEX_KEY = "travelnest.vouchers.index.v1";
const ITEM_PREFIX = "travelnest.voucher.";

export interface CachedVoucher {
  bookingId: string;
  bookingRef: string;
  qrVoucherCode: string;
  listingId: string;
  listingSlug?: string;
  listingTitle: string;
  thumbnailKey?: string;
  thumbnail?: Thumbnail;
  imageUrl?: string;
  optionId?: string;
  optionName: string;
  slotId?: string;
  /** ISO datetime of the booked slot (slot_start_time). */
  activityDate: string;
  createdAt: string;
  quantity: number;
  currency: string;
  totalAmount: number;
  status: BookingStatus;
  travelers: Traveler[];
  supplierId?: string;
  supplierName?: string;
}

async function readIndex(): Promise<string[]> {
  try {
    const raw = await SecureStore.getItemAsync(INDEX_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

async function writeIndex(ids: string[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(ids));
  } catch {
    // Fail soft — offline voucher caching is best-effort.
  }
}

export const voucherCache = {
  async loadVouchers(): Promise<CachedVoucher[]> {
    const ids = await readIndex();
    const vouchers: CachedVoucher[] = [];
    for (const id of ids) {
      try {
        const raw = await SecureStore.getItemAsync(`${ITEM_PREFIX}${id}`);
        if (raw) vouchers.push(JSON.parse(raw) as CachedVoucher);
      } catch {
        // Skip unreadable/corrupt entries.
      }
    }
    return vouchers.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async saveVoucher(voucher: CachedVoucher): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        `${ITEM_PREFIX}${voucher.bookingId}`,
        JSON.stringify(voucher),
      );
      const ids = await readIndex();
      if (!ids.includes(voucher.bookingId)) {
        await writeIndex([...ids, voucher.bookingId]);
      }
    } catch {
      // Fail soft.
    }
  },

  async updateVoucherStatus(id: string, status: BookingStatus): Promise<void> {
    try {
      const raw = await SecureStore.getItemAsync(`${ITEM_PREFIX}${id}`);
      if (!raw) return;
      const voucher = JSON.parse(raw) as CachedVoucher;
      await SecureStore.setItemAsync(
        `${ITEM_PREFIX}${id}`,
        JSON.stringify({ ...voucher, status }),
      );
    } catch {
      // Fail soft.
    }
  },

  async removeVoucher(id: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(`${ITEM_PREFIX}${id}`);
      const ids = await readIndex();
      await writeIndex(ids.filter((x) => x !== id));
    } catch {
      // Fail soft.
    }
  },

  async clearVouchers(): Promise<void> {
    try {
      const ids = await readIndex();
      for (const id of ids) {
        await SecureStore.deleteItemAsync(`${ITEM_PREFIX}${id}`).catch(() => undefined);
      }
      await SecureStore.deleteItemAsync(INDEX_KEY);
    } catch {
      // Fail soft.
    }
  },
};
