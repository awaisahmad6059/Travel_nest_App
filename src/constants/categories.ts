import type { CategoryId } from "@/types";

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { id: "attractions", label: "Attractions", emoji: "🏛️" },
  { id: "tours", label: "Tours", emoji: "🚌" },
  { id: "experiences", label: "Experiences", emoji: "✨" },
  { id: "food", label: "Food & Drinks", emoji: "🍜" },
  { id: "activities", label: "Activities", emoji: "🎢" },
  { id: "transport", label: "Transport", emoji: "🚗" },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export function categoryLabel(id: CategoryId): string {
  return CATEGORY_MAP[id]?.label ?? id;
}

export function categoryEmoji(id: CategoryId): string {
  return CATEGORY_MAP[id]?.emoji ?? "📍";
}
