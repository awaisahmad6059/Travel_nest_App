import type { Price } from "./listing";

export type PaymentMethodType = "card" | "wallet" | "bank";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  /** Masked detail, e.g. "•••• 4242". */
  detail: string;
}

export interface Coupon {
  code: string;
  description: string;
  /** Percentage off, e.g. 10 for 10%. */
  percentOff?: number;
  /** Fixed amount off. */
  amountOff?: number;
}

export interface PaymentResult {
  status: "success" | "failure";
  transactionId: string;
  message: string;
}

/** Payment gateway is stubbed for now — real gateway SDK arrives later. */
export interface ChargeInput {
  amount: Price;
  paymentMethodId: string;
  couponCode?: string | null;
}
