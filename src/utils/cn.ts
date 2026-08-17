/** Tiny className combiner (no dependency). Filters falsy values and joins with a space. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
