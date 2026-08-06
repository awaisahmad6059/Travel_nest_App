import type { ImageTone } from "@/types";

/**
 * Placeholder imagery. Real Cloudinary URLs will be provided later — the
 * `thumbnail.key` on each listing maps to one of these tones/labels so every
 * card and detail screen renders a pleasant colored placeholder in the meantime.
 */

export const TONE_STYLES: Record<ImageTone, string> = {
  blue: "bg-brand-100",
  teal: "bg-teal-100",
  orange: "bg-accent-100",
  purple: "bg-purple-100",
  rose: "bg-rose-100",
  amber: "bg-amber-100",
  green: "bg-green-100",
  slate: "bg-slate-200",
};

export const TONE_BARS: Record<ImageTone, string> = {
  blue: "bg-brand-500",
  teal: "bg-teal-500",
  orange: "bg-accent-500",
  purple: "bg-purple-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  slate: "bg-slate-500",
};
