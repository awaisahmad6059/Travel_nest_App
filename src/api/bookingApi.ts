import { USE_MOCKS_BOOKINGS } from "@/config";
import { request, mockDelay } from "./client";
import { MOCK_BOOKINGS } from "@/mocks/bookings";
import {
  BookingDTO,
  bookingDtoToBooking,
  CheckoutRequest,
  mapBookingStatus,
  mapPrice,
} from "./contracts";
import { CachedVoucher, voucherCache } from "@/features/booking/voucherCache";
import type { Booking, BookingStatus, CreateBookingInput, Price } from "@/types";

/**
 * Bookings service (API_HANDOFF.md §4.3) — My Bookings (customer) and the
 * Booking Inbox (supplier).
 *
 * Checkout uses the documented request shape:
 *   POST /bookings  { hold_id, lead_name, lead_email, lead_phone,
 *                     special_requirements, payment_token }
 * The booking response carries `qr_voucher_code` which is cached offline
 * (voucherCache) so My Bookings works without a connection and the voucher
 * QR stays viewable offline (SRS requirement).
 *
 * In mock mode bookings live in an in-memory store seeded from MOCK_BOOKINGS,
 * so bookings created during the session are also retrievable by id.
 */
const mockBookingStore: Booking[] = [...MOCK_BOOKINGS];

function bookingDtoToCachedVoucher(dto: BookingDTO): CachedVoucher {
  const travelers = dto.traveler_details?.lead_name
    ? [
        {
          id: "lead",
          name: dto.traveler_details.lead_name,
          email: dto.traveler_details.lead_email,
          phone: dto.traveler_details.lead_phone,
        },
      ]
    : [];
  return {
    bookingId: dto.id,
    bookingRef: dto.booking_reference,
    qrVoucherCode: dto.qr_voucher_code,
    listingId: dto.listing_id,
    listingSlug: dto.listing_slug,
    listingTitle: dto.listing_title ?? dto.listing_id,
    thumbnailKey: dto.thumbnail_key,
    optionId: dto.option_id,
    optionName: dto.option_name,
    slotId: dto.slot_id,
    activityDate: dto.slot_start_time,
    createdAt: dto.created_at,
    quantity: dto.total_travelers,
    currency: dto.currency ?? "USD",
    totalAmount: dto.gross_amount,
    status: mapBookingStatus(dto.status),
    travelers,
    supplierId: dto.supplier_id,
  };
}

function cachedVoucherToBooking(v: CachedVoucher): Booking {
  const quantity = Math.max(1, v.quantity);
  const total = mapPrice(v.totalAmount, v.currency) as Price;
  const unitPrice = mapPrice(v.totalAmount / quantity, v.currency) as Price;
  return {
    id: v.bookingId,
    bookingRef: v.bookingRef,
    items: [
      {
        listingId: v.listingId,
        listingSlug: v.listingSlug ?? "",
        title: v.listingTitle,
        thumbnailKey: v.thumbnailKey ?? "",
        thumbnail: v.thumbnail,
        imageUrl: v.imageUrl,
        optionName: v.optionName,
        date: v.activityDate,
        quantity,
        unitPrice,
        total,
      },
    ],
    status: v.status,
    createdAt: v.createdAt,
    activityDate: v.activityDate,
    travelers: v.travelers,
    total,
    voucherCode: v.qrVoucherCode,
    qrToken: v.qrVoucherCode,
    supplierId: v.supplierId ?? "",
    supplierName: v.supplierName,
  };
}

export const bookingApi = {
  async getMyBookings(): Promise<Booking[]> {
    if (USE_MOCKS_BOOKINGS) return mockDelay(mockBookingStore);
    // Backend list endpoint (§5.2) is not built yet — the offline voucher
    // cache is the source of truth for bookings created from this app.
    const vouchers = await voucherCache.loadVouchers();
    return vouchers.map(cachedVoucherToBooking);
  },

  async getBooking(idOrRef: string): Promise<Booking | null> {
    if (USE_MOCKS_BOOKINGS) {
      const booking = mockBookingStore.find((b) => b.id === idOrRef);
      return mockDelay(booking ?? null, 300);
    }
    // GET /bookings/:ref accepts the booking_reference or the id. Falls back
    // to the offline voucher cache when offline or when the backend list/ref
    // is temporarily unavailable.
    try {
      const dto = await request<BookingDTO>(
        `/bookings/${encodeURIComponent(idOrRef)}`,
      );
      return bookingDtoToBooking(dto);
    } catch {
      const vouchers = await voucherCache.loadVouchers();
      const hit =
        vouchers.find((v) => v.bookingId === idOrRef) ??
        vouchers.find((v) => v.bookingRef === idOrRef);
      return hit ? cachedVoucherToBooking(hit) : null;
    }
  },

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    if (USE_MOCKS_BOOKINGS) {
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
    // TEMP: demo slots (availabilityApi.demoSlotsFor) have no backend holds, so
    // the backend can't validate their tokens. Simulate the booking locally and
    // cache the voucher — confirmation, My Bookings and offline vouchers all
    // read voucherCache, so the flow stays complete end-to-end.
    if (input.holdId?.startsWith("hold_demo_")) {
      const item = input.items[0];
      const voucher: CachedVoucher = {
        bookingId: `bk_demo_${Date.now()}`,
        bookingRef: `TN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        qrVoucherCode: `TNV-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`,
        listingId: item.listingId,
        listingSlug: item.listingSlug,
        listingTitle: item.title,
        thumbnailKey: item.thumbnailKey,
        thumbnail: item.thumbnail,
        imageUrl: item.imageUrl,
        optionName: item.optionName,
        activityDate: item.date,
        createdAt: new Date().toISOString(),
        quantity: item.quantity,
        currency: item.total.currency,
        totalAmount: item.total.amount,
        status: "confirmed",
        travelers: input.travelers,
      };
      await voucherCache.saveVoucher(voucher);
      return mockDelay(cachedVoucherToBooking(voucher), 300);
    }
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
    // Offline voucher caching (API_HANDOFF.md §4.3 step 7).
    await voucherCache.saveVoucher(bookingDtoToCachedVoucher(dto));
    return bookingDtoToBooking(dto);
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    if (USE_MOCKS_BOOKINGS) {
      const booking = mockBookingStore.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");
      const updated = { ...booking, status: "cancelled" as const };
      mockBookingStore[mockBookingStore.indexOf(booking)] = updated;
      return mockDelay(updated);
    }
    // Planned: POST /bookings/:id/cancel (§5.2) — backend-blocked for now.
    const dto = await request<BookingDTO>(
      `/bookings/${encodeURIComponent(id)}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    );
    const updated: BookingStatus = mapBookingStatus(dto.status);
    await voucherCache.updateVoucherStatus(id, updated);
    return bookingDtoToBooking(dto);
  },
};
