import type { Price } from "./listing";

export interface Supplier {
  id: string;
  name: string;
  verified: boolean;
  responseRate: number;
  rating: number;
  ratingCount: number;
  avatarEmoji: string;
  location: string;
}

export interface DashboardStats {
  todayBookings: number;
  upcomingCheckIns: number;
  pendingConfirmations: number;
  monthRevenue: Price;
  averageRating: number;
}

export interface Payout {
  id: string;
  reference: string;
  status: "scheduled" | "processing" | "paid" | "failed";
  amount: Price;
  period: string;
  paidAt?: string;
}

export interface PayoutSummary {
  balance: Price;
  pending: Price;
  history: Payout[];
}
