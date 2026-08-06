import { USE_MOCKS } from "@/config";
import { request, mockDelay } from "./client";
import type { Coupon, PaymentMethod, PaymentResult } from "@/types";

/**
 * Payments — STUBBED. The real gateway SDK + backend payment module arrive
 * later. These functions return plausible mock data so the checkout UI flows
 * work end-to-end, and share the exact shapes the future API will use.
 */

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm_1", type: "card", label: "Visa •••• 4242", detail: "Exp 08/28" },
  { id: "pm_2", type: "card", label: "Mastercard •••• 1881", detail: "Exp 11/27" },
  { id: "pm_3", type: "wallet", label: "Apple Pay", detail: "Saved wallet" },
];

export const paymentApi = {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    if (USE_MOCKS) return mockDelay(MOCK_PAYMENT_METHODS, 300);
    return request("/payment-methods");
  },

  async applyCoupon(code: string): Promise<Coupon | null> {
    if (USE_MOCKS) {
      const normalized = code.trim().toUpperCase();
      const coupons: Coupon[] = [
        { code: "WELCOME10", description: "10% off your first booking", percentOff: 10 },
        { code: "SUMMER25", description: "$25 off orders over $100", amountOff: 25 },
      ];
      const hit = coupons.find((c) => c.code === normalized);
      if (!hit) {
        throw new Error(`Coupon code "${code}" is not valid.`);
      }
      return mockDelay(hit, 500);
    }
    return request(`/coupons/validate?code=${encodeURIComponent(code)}`);
  },

  /** Simulates charging the card via the (future) payment gateway. */
  async charge(input: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    couponCode?: string | null;
  }): Promise<PaymentResult> {
    if (USE_MOCKS) {
      const ok = Math.random() > 0.05; // rarely simulate a failure to show the error state
      return mockDelay(
        ok
          ? {
              status: "success",
              transactionId: `TXN-${Date.now()}`,
              message: "Payment successful",
            }
          : {
              status: "failure",
              transactionId: "",
              message: "Your card was declined. Please try another method.",
            },
        1600,
      );
    }
    return request("/payments/charge", { method: "POST", body: JSON.stringify(input) });
  },
};
