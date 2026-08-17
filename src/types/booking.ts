import type { Price, Thumbnail } from "./listing";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface Traveler {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface BookingItem {
  listingId: string;
  listingSlug: string;
  title: string;
  thumbnailKey: string;
  /** Full placeholder thumbnail (emoji/tone/label) shown until real images exist. */
  thumbnail?: Thumbnail;
  /** Real listing image URL when available (empty pre-Cloudinary). */
  imageUrl?: string;
  optionName: string;
  /** ISO date string for the activity date. */
  date: string;
  quantity: number;
  unitPrice: Price;
  total: Price;
}

export interface Booking {
  id: string;
  bookingRef: string;
  items: BookingItem[];
  status: BookingStatus;
  createdAt: string;
  activityDate: string;
  travelers: Traveler[];
  total: Price;
  voucherCode: string;
  supplierId: string;
  supplierName?: string;
}

export interface CreateBookingInput {
  items: BookingItem[];
  travelers: Traveler[];
  total: Price;
  /**
   * Inventory hold id (API_HANDOFF.md §4.2) — required by the real backend.
   * Mock mode ignores it.
   */
  holdId?: string;
  /** Payment gateway token produced by the payment step — passed to /bookings. */
  paymentToken?: string;
  /** Free-text special requirements (optional). */
  specialRequirements?: string;
  /** Supplier who owns the listing being booked. */
  supplierId?: string;
}
