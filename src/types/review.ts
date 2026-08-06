export interface Review {
  id: string;
  listingId: string;
  authorName: string;
  authorEmoji: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  date: string;
  supplierReply?: string;
}
