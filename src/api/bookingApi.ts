import { USE_MOCKS } from "@/config";
import { request, mockDelay } from "./client";
import { MOCK_BOOKINGS } from "@/mocks/bookings";
import type { Booking, CreateBookingInput } from "@/types";

/**
 * Bookings service — My Bookings (customer) and the Booking Inbox (supplier).
 *
 * In mock mode bookings live in an in-memory store seeded from MOCK_BOOKINGS,
 * so bookings created during the session are also retrievable by id.
 */
const mockBookingStore: Booking[] = [...MOCK_BOOKINGS];

export const bookingApi = {
  async getMyBookings(): Promise<Booking[]> {
    if (USE_MOCKS) return mockDelay(mockBookingStore);
    return request("/bookings");
  },

  async getBooking(id: string): Promise<Booking | null> {
    if (USE_MOCKS) {
      const booking = mockBookingStore.find((b) => b.id === id);
      return mockDelay(booking ?? null, 300);
    }
    return request(`/bookings/${id}`);
  },

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    if (USE_MOCKS) {
      const created: Booking = {
        id: `bk_${Date.now()}`,
        bookingRef: `TN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        items: input.items,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        activityDate: input.items[0]?.date ?? new Date().toISOString(),
        travelers: input.travelers,
        total: input.total,
        voucherCode: `TNV-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`,
        qrToken: `QR:${Math.random().toString(36).slice(2, 10)}`,
        supplierId: "sup_1",
        supplierName: "Summit Adventures Co.",
      };
      mockBookingStore.unshift(created);
      return mockDelay(created, 900);
    }
    return request("/bookings", { method: "POST", body: JSON.stringify(input) });
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    if (USE_MOCKS) {
      const booking = mockBookingStore.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");
      const updated = { ...booking, status: "cancelled" as const };
      mockBookingStore[mockBookingStore.indexOf(booking)] = updated;
      return mockDelay(updated);
    }
    return request(`/bookings/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};
