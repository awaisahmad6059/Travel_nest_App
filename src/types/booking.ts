import type { Price } from "./listing";

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
  /** Mock QR payload — rendered as a placeholder grid until real QR service is available. */
  qrToken: string;
  supplierId: string;
  supplierName?: string;
}

export interface CreateBookingInput {
  items: BookingItem[];
  travelers: Traveler[];
  total: Price;
}
