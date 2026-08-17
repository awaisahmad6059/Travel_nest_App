import { USE_MOCKS_SUPPLIER } from "@/config";
import { request, mockDelay } from "./client";
import { MOCK_SUPPLIER_BOOKINGS } from "@/mocks/bookings";
import { MOCK_DASHBOARD_STATS, MOCK_PAYOUTS } from "@/mocks/dashboard";
import { MOCK_SUPPLIERS } from "@/mocks/suppliers";
import {
  BookingDTO,
  bookingDtoToBooking,
  mapPrice,
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

const mockSupplierBookingStore: Booking[] = [...MOCK_SUPPLIER_BOOKINGS];

function deriveDashboardFromBookings(
  bookings: Booking[],
  supplierId: string,
): { stats: DashboardStats; recentBookings: Booking[] } {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const todayBookings = bookings.filter(
    (b) => b.activityDate?.slice(0, 10) === todayStr && b.status !== "cancelled",
  ).length;

  const upcomingCheckIns = bookings.filter(
    (b) => b.activityDate && new Date(b.activityDate) > now && b.status === "confirmed",
  ).length;

  const pendingConfirmations = bookings.filter((b) => b.status === "pending").length;

  const thisMonth = now.toISOString().slice(0, 7);
  const monthRevenue = bookings
    .filter((b) => b.createdAt?.slice(0, 7) === thisMonth && b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.total?.amount ?? 0), 0);

  const recentBookings = bookings.slice(0, 5);

  return {
    stats: {
      todayBookings,
      upcomingCheckIns,
      pendingConfirmations,
      monthRevenue: mapPrice(monthRevenue, "USD"),
      averageRating: 4.8,
    },
    recentBookings,
  };
}

export const supplierApi = {
  async getDashboard(supplierId: string): Promise<{
    stats: DashboardStats;
    supplier: Supplier;
    recentBookings: Booking[];
  }> {
    if (USE_MOCKS_SUPPLIER) {
      const supplier =
        MOCK_SUPPLIERS.find((s) => s.id === supplierId) ?? MOCK_SUPPLIERS[0];
      return mockDelay({
        stats: MOCK_DASHBOARD_STATS,
        supplier,
        recentBookings: mockSupplierBookingStore.slice(0, 4),
      });
    }
    const res = await request<{ value: BookingDTO[]; Count: number } | BookingDTO[]>(
      `/bookings/supplier/list?supplier_id=${encodeURIComponent(supplierId)}`,
    );
    const dtos = Array.isArray(res) ? res : (res?.value ?? []);
    const bookings = dtos.map(bookingDtoToBooking);
    const { stats, recentBookings } = deriveDashboardFromBookings(
      bookings,
      supplierId,
    );
    return {
      stats,
      supplier: {
        id: supplierId,
        name: "Your business",
        verified: true,
        responseRate: 95,
        rating: stats.averageRating,
        ratingCount: 0,
        avatarEmoji: "🏔️",
        location: "",
      },
      recentBookings,
    };
  },

  async getBookingInbox(supplierId: string): Promise<Booking[]> {
    if (USE_MOCKS_SUPPLIER) return mockDelay(mockSupplierBookingStore);
    const res = await request<{ value: BookingDTO[]; Count: number } | BookingDTO[]>(
      `/bookings/supplier/list?supplier_id=${encodeURIComponent(supplierId)}`,
    );
    const dtos = Array.isArray(res) ? res : (res?.value ?? []);
    return dtos.map(bookingDtoToBooking);
  },

  async getPayouts(supplierId: string): Promise<PayoutSummary> {
    if (USE_MOCKS_SUPPLIER) return mockDelay(MOCK_PAYOUTS);
    try {
      const [ledger, history] = await Promise.all([
        request<PayoutLedgerDTO>(
          `/payouts/ledger/${encodeURIComponent(supplierId)}`,
        ),
        request<PayoutHistoryItemDTO[]>(
          `/payouts/history/${encodeURIComponent(supplierId)}`,
        ),
      ]);
      return payoutLedgerToSummary(ledger, history);
    } catch {
      return {
        balance: mapPrice(0, "USD"),
        pending: mapPrice(0, "USD"),
        history: [],
      };
    }
  },

  async confirmBooking(id: string): Promise<Booking> {
    if (USE_MOCKS_SUPPLIER) {
      const booking = mockSupplierBookingStore.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");
      const updated = { ...booking, status: "confirmed" as const };
      mockSupplierBookingStore[mockSupplierBookingStore.indexOf(booking)] =
        updated;
      return mockDelay(updated);
    }
    const dto = await request<BookingDTO>(
      `/bookings/${encodeURIComponent(id)}/confirm`,
      { method: "POST" },
    );
    return bookingDtoToBooking(dto);
  },

  async rejectBooking(id: string, reason: string): Promise<Booking> {
    if (USE_MOCKS_SUPPLIER) {
      const booking = mockSupplierBookingStore.find((b) => b.id === id);
      if (!booking) throw new Error("Booking not found");
      const updated = { ...booking, status: "cancelled" as const };
      mockSupplierBookingStore[mockSupplierBookingStore.indexOf(booking)] =
        updated;
      return mockDelay(updated);
    }
    const dto = await request<BookingDTO>(
      `/bookings/${encodeURIComponent(id)}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    );
    return bookingDtoToBooking(dto);
  },
};
