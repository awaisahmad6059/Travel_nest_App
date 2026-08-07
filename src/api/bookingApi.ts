import { USE_MOCKS } from "@/config";
import { request, mockDelay } from "./client";
import { MOCK_BOOKINGS } from "@/mocks/bookings";
import {
  BookingDTO,
  bookingDtoToBooking,
  CheckoutRequest,
} from "./contracts";
import type { Booking, CreateBookingInput } from "@/types";

/**
 * Bookings service (API_HANDOFF.md §4.3) — My Bookings (customer) and the
 * Booking Inbox (supplier).
 *
 * Checkout uses the documented request shape:
 *   POST /bookings  { hold_id, lead_name, lead_email, lead_phone,
 *                     special_requirements, payment_token }
 * The booking response carries `qr_voucher_code` which must be cached offline
 * so My Bookings works without a connection.
 *
 * In mock mode bookings live in an in-memory store seeded from MOCK_BOOKINGS,
 * so bookings created during the session are also retrievable by id.
 */
const mockBookingStore: Booking[] = [...MOCK_BOOKINGS];

export const bookingApi = {
  async getMyBookings(): Promise<Booking[]> {
    if (USE_MOCKS) return mockDelay(mockBookingStore);
    // Planned: GET /bookings?status=UPCOMING|COMPLETED (§5.2)
    const dtos = await request<BookingDTO[]>("/bookings");
    return dtos.map(bookingDtoToBooking);
  },

  async getBooking(idOrRef: string): Promise<Booking | null> {
    if (USE_MOCKS) {
      const booking = mockBookingStore.find((b) => b.id === idOrRef);
      return mockDelay(booking ?? null, 300);
    }
    // GET /bookings/:ref accepts the booking_reference or the id.
    const dto = await request<BookingDTO | null>(
      `/bookings/${encodeURIComponent(idOrRef)}`,
    );
    return dto ? bookingDtoToBooking(dto) : null;
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
    const lead = input.travelers[0];
    if (!input.holdId) {
      throw new Error(
        "Missing inventory hold — hold a slot first via availabilityApi.hold() before checkout.",
      );
    }
    if (!input.paymentToken) {
      throw new Error("Missing payment token — complete payment before checkout.");
    }
    const body: CheckoutRequest = {
      hold_id: input.holdId,
      lead_name: lead?.name ?? "",
      lead_email: lead?.email ?? "",
      lead_phone: lead?.phone ?? "",
      special_requirements: input.specialRequirements,
      payment_token: input.paymentToken,
    };
    const dto = await request<BookingDTO>("/bookings", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return bookingDtoToBooking(dto);
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    if (USE_MOCKS) {
      const booking = mockBookingStore.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");
      const updated = { ...booking, status: "cancelled" as const };
      mockBookingStore[mockBookingStore.indexOf(booking)] = updated;
      return mockDelay(updated);
    }
    // Planned: POST /bookings/:id/cancel (§5.2)
    const dto = await request<BookingDTO>(`/bookings/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return bookingDtoToBooking(dto);
  },
};
