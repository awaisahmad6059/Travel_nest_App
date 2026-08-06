import type { Price } from "@/types";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  SGD: "S$",
  EUR: "€",
};

/** Formats a number as a currency string for the given currency code. */
export function formatCurrency(amount: number, currency = "USD"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? "";
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatPrice(price: Price): string {
  return price.display || formatCurrency(price.amount, price.currency);
}

/** Formats an ISO date string as "12 Aug 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Formats an ISO date string as a short human "today"/"tomorrow"/date label. */
export function formatRelativeDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return formatDate(iso);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[0-9\s-]{7,15}$/.test(phone.trim());
}
