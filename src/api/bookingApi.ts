import { USE_MOCKS_BOOKINGS } from "@/config";
import { supabase } from "@/lib/supabase";
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
 * After creating a booking (via NestJS backend or locally for demo holds),
 * insert it into the Supabase `bookings` table so the web admin panel
 * (https://travelnest-jet.vercel.app/admin/bookings) can see it.
 */
async function syncBookingToSupabase(
  dto: BookingDTO | null,
  voucher: CachedVoucher,
  input: CreateBookingInput,
) {
  try {
    const item = input.items[0];
    const lead = input.travelers[0];
    const platformFee = dto
      ? dto.platform_fee
      : Math.round(voucher.totalAmount * 0.1 * 100) / 100;
    const supplierPayout = dto
      ? dto.supplier_payout
      : Math.round((voucher.totalAmount - platformFee) * 100) / 100;

    const row: Record<string, unknown> = {
      id: voucher.bookingId,
      booking_reference: voucher.bookingRef,
      customer_id: lead?.email ?? "guest",
      listing_id: item?.listingId ?? voucher.listingId,
      supplier_id: input.supplierId ?? voucher.supplierId ?? "sup-oceanic-tours",
      option_id: "",
      option_name: item?.optionName ?? voucher.optionName,
      slot_id: voucher.slotId ?? "",
      slot_start_time: item?.date ?? voucher.activityDate,
      total_travelers: item?.quantity ?? 1,
      gross_amount: voucher.totalAmount,
      platform_fee: platformFee,
      supplier_payout: supplierPayout,
      currency: voucher.currency ?? "USD",
      status: "CONFIRMED",
      confirmation_type: "INSTANT",
      qr_voucher_code: voucher.voucherCode,
      traveler_details: {
        lead_name: lead?.name ?? "",
        lead_email: lead?.email ?? "",
        lead_phone: lead?.phone ?? "",
        special_requirements: input.specialRequirements ?? "",
        guest_names: input.travelers.map((t) => t.name),
      },
      payment_intent_id: "",
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("bookings").insert(row);
    if (error) {
      console.warn("[bookingApi] Failed to sync booking to Supabase:", error.message);
    }
  } catch (e) {
    console.warn("[bookingApi] Supabase sync error:", e);
  }
}

/**
 * Bookings service (API_HANDOFF.md §4.3) — My Bookings (customer) and the
 * Booking Inbox (supplier).
 *
 * Checkout uses the documented request shape:
 *   POST /bookings  { hold_id, lead_name, lead_email, lead_phone,
 *                     special_requirements, payment_token }
 * The booking response carries `booking_reference` which is cached offline
 * (voucherCache) so My Bookings works without a connection and the voucher
 * stays viewable offline (SRS requirement).
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
    voucherCode: dto.qr_voucher_code,
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
    voucherCode: v.voucherCode,
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
        voucherCode: `TNV-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`,
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
      // Sync to Supabase so web admin can see it
      void syncBookingToSupabase(null, voucher, input);
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
    // Offline voucher caching (API_HANDOFF.md §4.3 step 7). The checkout DTO
    // only carries the listing id, so carry the client-side thumbnail/image
    // over into the cached voucher — otherwise My Bookings falls back to a bare
    // first-letter placeholder instead of the listing image.
    const voucher = bookingDtoToCachedVoucher(dto);
    const bookedItem = input.items[0];
    voucher.thumbnail = bookedItem?.thumbnail;
    voucher.imageUrl = bookedItem?.imageUrl;
    await voucherCache.saveVoucher(voucher);
    // Sync to Supabase so web admin panel can see this booking
    void syncBookingToSupabase(dto, voucher, input);
    return cachedVoucherToBooking(voucher);
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
