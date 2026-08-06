export type CategoryId =
  | "attractions"
  | "tours"
  | "experiences"
  | "food"
  | "activities"
  | "transport";

export type ImageTone =
  | "blue"
  | "teal"
  | "orange"
  | "purple"
  | "rose"
  | "amber"
  | "green"
  | "slate";

export interface Thumbnail {
  /** Placeholder key used until Cloudinary images are wired up. */
  key: string;
  label: string;
  emoji: string;
  tone: ImageTone;
}

export interface ListingImage {
  /** Empty for now — filled with Cloudinary URLs later. */
  url?: string;
  caption?: string;
}

export interface Price {
  amount: number;
  currency: "USD" | "SGD" | "EUR";
  /** Pre-formatted display string, e.g. "$24.00". */
  display: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  label: string;
}

export interface ListingOption {
  id: string;
  name: string;
  price: Price;
  includedItems?: string[];
}

export interface ItineraryStep {
  time: string;
  title: string;
  description?: string;
}

export interface ReviewSummary {
  pros: string[];
  cons: string[];
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  category: CategoryId;
  destination: string;
  city: string;
  country: string;
  images: ListingImage[];
  thumbnail: Thumbnail;
  rating: number;
  reviewCount: number;
  price: Price;
  duration: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  includes: string[];
  excludes: string[];
  itinerary: ItineraryStep[];
  meetingPoint?: GeoPoint;
  options: ListingOption[];
  freeCancellation: boolean;
  instantConfirmation: boolean;
  supplierId: string;
  tags: string[];
  reviewSummary?: ReviewSummary;
  isTrending?: boolean;
  isDeal?: boolean;
  recommendedFor?: string[];
}

export interface SearchFilters {
  category?: CategoryId | null;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  freeCancellation?: boolean;
  instantConfirmation?: boolean;
  date?: string | null;
}

export type SearchSort = "recommended" | "price-asc" | "price-desc" | "rating";

export interface SearchParams {
  query?: string;
  city?: string;
  filters?: SearchFilters;
  sort?: SearchSort;
}

export interface SearchResult {
  items: Listing[];
  total: number;
}
