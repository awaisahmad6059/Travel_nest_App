import { USE_MOCKS } from "@/config";
import { request, mockDelay } from "./client";
import { MOCK_SUPPLIER_BOOKINGS } from "@/mocks/bookings";
import { MOCK_DASHBOARD_STATS, MOCK_PAYOUTS } from "@/mocks/dashboard";
import { MOCK_SUPPLIERS } from "@/mocks/suppliers";
import type {
  Booking,
  DashboardStats,
  PayoutSummary,
  Supplier,
} from "@/types";

/**
 * Supplier services — dashboard, booking inbox, payouts.
 * Mock inbox lives in an in-memory store so confirm/reject persist for the session.
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
    return request(`/suppliers/${supplierId}/dashboard`);
  },

  async getBookingInbox(supplierId: string): Promise<Booking[]> {
    if (USE_MOCKS) return mockDelay(mockSupplierBookingStore);
    return request(`/suppliers/${supplierId}/bookings`);
  },

  async getPayouts(supplierId: string): Promise<PayoutSummary> {
    if (USE_MOCKS) return mockDelay(MOCK_PAYOUTS);
    return request(`/suppliers/${supplierId}/payouts`);
  },

  async confirmBooking(id: string): Promise<Booking> {
    if (USE_MOCKS) {
      const booking = mockSupplierBookingStore.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");
      const updated = { ...booking, status: "confirmed" as const };
      mockSupplierBookingStore[mockSupplierBookingStore.indexOf(booking)] = updated;
      return mockDelay(updated);
    }
    return request(`/bookings/${id}/confirm`, { method: "POST" });
  },

  async rejectBooking(id: string, reason: string): Promise<Booking> {
    if (USE_MOCKS) {
      const booking = mockSupplierBookingStore.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");
      const updated = { ...booking, status: "cancelled" as const };
      mockSupplierBookingStore[mockSupplierBookingStore.indexOf(booking)] = updated;
      return mockDelay(updated);
    }
    return request(`/bookings/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};
