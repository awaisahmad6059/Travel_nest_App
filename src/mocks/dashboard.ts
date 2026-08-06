import type { DashboardStats, PayoutSummary } from "@/types";

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  todayBookings: 12,
  upcomingCheckIns: 9,
  pendingConfirmations: 3,
  monthRevenue: { amount: 18540, currency: "USD", display: "$18,540.00" },
  averageRating: 4.8,
};

export const MOCK_PAYOUTS: PayoutSummary = {
  balance: { amount: 3240.5, currency: "USD", display: "$3,240.50" },
  pending: { amount: 1180, currency: "USD", display: "$1,180.00" },
  history: [
    {
      id: "pay_001",
      reference: "PAY-2026-0071",
      status: "paid",
      amount: { amount: 4120, currency: "USD", display: "$4,120.00" },
      period: "1–15 July 2026",
      paidAt: "2026-07-20T09:00:00Z",
    },
    {
      id: "pay_002",
      reference: "PAY-2026-0083",
      status: "paid",
      amount: { amount: 3850, currency: "USD", display: "$3,850.00" },
      period: "16–30 June 2026",
      paidAt: "2026-07-05T09:00:00Z",
    },
    {
      id: "pay_003",
      reference: "PAY-2026-0092",
      status: "processing",
      amount: { amount: 1180, currency: "USD", display: "$1,180.00" },
      period: "1–5 August 2026",
    },
  ],
};
