export interface Review {
  id: string;
  listingId: string;
  authorName: string;
  authorEmoji: string;
  avatarUrl?: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  photos?: string[];
  helpfulCount?: number;
  date: string;
  supplierReply?: string;
}
