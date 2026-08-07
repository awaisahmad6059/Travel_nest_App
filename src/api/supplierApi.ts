import { USE_MOCKS } from "@/config";
import { request, mockDelay } from "./client";
import { MOCK_SUPPLIER_BOOKINGS } from "@/mocks/bookings";
import { MOCK_DASHBOARD_STATS, MOCK_PAYOUTS } from "@/mocks/dashboard";
import { MOCK_SUPPLIERS } from "@/mocks/suppliers";
import {
  BookingDTO,
  bookingDtoToBooking,
  payoutLedgerToSummary,
  PayoutLedgerDTO,
  PayoutHistoryItemDTO,
} from "./contracts";
import type {
  Booking,
  DashboardStats,
  PayoutSummary,
  Supplier,
} from "@/types";

/**
 * Supplier services (API_HANDOFF.md §4.3, §4.6, §5.3) — dashboard, booking
 * inbox and payouts.
 *
 * Ready endpoints used here:
 *   GET /bookings/supplier/list?supplier_id=   (inbox)
 *   GET /payouts/ledger/:supplierId            (balance)
 *   GET /payouts/history/:supplierId           (history)
 * Confirm/reject and the dashboard are planned (§5.3).
 */
const mockSupplierBookingStore: Booking[] = [...MOCK_SUPPLIER_BOOKINGS];

export const supplierApi = {
  async getDashboard(supplierId: string): Promise<{
    stats: DashboardStats;
    supplier: Supplier;
    recentBookings: Booking[];
  }> {
    if (USE_MOCKS) {
      const supplier = MOCK_SUPPLIERS.find((s) => s.id === supplierId) ?? MOCK_SUPPLIERS[0];
      return mockDelay({
        stats: MOCK_DASHBOARD_STATS,
        supplier,
        recentBookings: mockSupplierBookingStore.slice(0, 4),
      });
    }
    // Planned: GET /supplier/dashboard (§5.3)
    return request(`/supplier/dashboard?supplier_id=${encodeURIComponent(supplierId)}`);
  },

  async getBookingInbox(supplierId: string): Promise<Booking[]> {
    if (USE_MOCKS) return mockDelay(mockSupplierBookingStore);
    const dtos = await request<BookingDTO[]>(
      `/bookings/supplier/list?supplier_id=${encodeURIComponent(supplierId)}`,
    );
    return dtos.map(bookingDtoToBooking);
  },

  async getPayouts(supplierId: string): Promise<PayoutSummary> {
    if (USE_MOCKS) return mockDelay(MOCK_PAYOUTS);
    const [ledger, history] = await Promise.all([
      request<PayoutLedgerDTO>(`/payouts/ledger/${encodeURIComponent(supplierId)}`),
      request<PayoutHistoryItemDTO[]>(`/payouts/history/${encodeURIComponent(supplierId)}`),
    ]);
    return payoutLedgerToSummary(ledger, history);
  },

  async confirmBooking(id: string): Promise<Booking> {
    if (USE_MOCKS) {
      const booking = mockSupplierBookingStore.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");
      const updated = { ...booking, status: "confirmed" as const };
      mockSupplierBookingStore[mockSupplierBookingStore.indexOf(booking)] = updated;
      return mockDelay(updated);
    }
    // Planned: POST /bookings/:id/confirm (§5.3)
    const dto = await request<BookingDTO>(`/bookings/${encodeURIComponent(id)}/confirm`, {
      method: "POST",
    });
    return bookingDtoToBooking(dto);
  },

  async rejectBooking(id: string, reason: string): Promise<Booking> {
    if (USE_MOCKS) {
      const booking = mockSupplierBookingStore.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");
      const updated = { ...booking, status: "cancelled" as const };
      mockSupplierBookingStore[mockSupplierBookingStore.indexOf(booking)] = updated;
      return mockDelay(updated);
    }
    // Planned: POST /bookings/:id/reject (§5.3)
    const dto = await request<BookingDTO>(`/bookings/${encodeURIComponent(id)}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return bookingDtoToBooking(dto);
  },
};
