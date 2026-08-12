/**
 * API contracts (API_HANDOFF.md) — wire DTOs returned by the NestJS backend
 * plus mappers that convert them into the app's internal types.
 *
 * These types mirror the documented shapes exactly:
 *   - §4.1 Listings & discovery
 *   - §4.2 Availability (inventory hold)
 *   - §4.3 Bookings (checkout)
 *   - §4.6 Payouts
 *   - §4.7 AI (mobile v1 subset)
 * Mappers are defensive: fields the API may not include yet fall back to
 * safe defaults so screens never crash on missing data.
 */

import type {
  Booking,
  BookingStatus,
  CategoryId,
  ImageTone,
  Listing,
  Payout,
  PayoutSummary,
  Price,
  Review,
  ReviewSummary,
  User,
} from "@/types";
import { categoryEmoji } from "@/constants/categories";

/* ------------------------------------------------------------------ */
/* Listings (§4.1)                                                     */
/* ------------------------------------------------------------------ */

export interface ListingImageDTO {
  url: string;
  alt?: string;
}

export interface ListingOptionDTO {
  id: string;
  name: string;
  price: number;
  currency?: string;
  age_group?: string;
}

export interface ListingItineraryDTO {
  time: string;
  title: string;
  description?: string;
}

export interface MeetingPointDTO {
  address?: string;
  latitude: number;
  longitude: number;
}

export interface ListingDTO {
  id: string;
  slug: string;
  title: string;
  base_price: number;
  currency: string;
  confirmation_type?: string;
  cancellation_policy?: string;
  cached_rating_avg?: number | null;
  cached_review_count?: number;
  images: ListingImageDTO[];
  options: ListingOptionDTO[];
  meeting_point?: MeetingPointDTO | null;
  available_slots?: SlotDTO[];
  category?: string;
  category_id?: string;
  category_name?: string;
  destination?: string;
  destination_id?: string;
  city?: string;
  country?: string;
  duration?: string;
  duration_minutes?: number;
  summary?: string;
  short_description?: string;
  description?: string;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: ListingItineraryDTO[];
  know_before_you_go?: string[];
  review_count?: number;
  free_cancellation?: boolean;
  instant_confirmation?: boolean;
  tags?: string[];
  is_trending?: boolean;
  is_deal?: boolean;
  merchandising_badges?: string[];
  recommended_for?: string[];
  supplier_id?: string;
  ai_review_summary?: ReviewSummaryDTO | null;
}

export interface CategoryDTO {
  id: string;
  name: string;
  label?: string;
  emoji?: string;
}

export interface DestinationDTO {
  slug: string;
  name: string;
  country?: string;
  top_listings?: ListingDTO[];
}

export interface SearchResponseDTO {
  items: ListingDTO[];
  total: number;
}

/* ------------------------------------------------------------------ */
/* Availability (§4.2)                                                 */
/* ------------------------------------------------------------------ */

export interface SlotDTO {
  id: string;
  listing_id: string;
  start_time: string;
  end_time: string;
  total_capacity: number;
  booked_capacity: number;
  held_capacity: number;
}

export interface HoldRequest {
  slot_id: string;
  option_id: string;
  quantity: number;
}

export interface HoldResponse {
  hold_id: string;
  expires_at: number;
}

/* ------------------------------------------------------------------ */
/* Bookings (§4.3)                                                     */
/* ------------------------------------------------------------------ */

export interface CheckoutRequest {
  hold_id: string;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  special_requirements?: string;
  payment_token: string;
}

export interface BookingDTO {
  id: string;
  booking_reference: string;
  listing_id: string;
  option_id: string;
  option_name: string;
  slot_id: string;
  slot_start_time: string;
  total_travelers: number;
  gross_amount: number;
  platform_fee: number;
  supplier_payout: number;
  currency: string;
  status: string;
  confirmation_type?: string;
  qr_voucher_code: string;
  traveler_details: {
    lead_name: string;
    lead_email: string;
    lead_phone: string;
  };
  created_at: string;
  listing_title?: string;
  listing_slug?: string;
  thumbnail_key?: string;
  supplier_id?: string;
}

/* ------------------------------------------------------------------ */
/* Payouts (§4.6)                                                      */
/* ------------------------------------------------------------------ */

export interface PayoutLedgerDTO {
  supplier_id: string;
  gross_booking_value: number;
  total_platform_commission: number;
  net_earned_balance: number;
  total_paid_out: number;
  pending_payout_balance: number;
  currency: string;
}

export interface PayoutHistoryItemDTO {
  id: string;
  reference: string;
  status: Payout["status"];
  amount: number;
  currency: string;
  period: string;
  paid_at?: string;
}

/* ------------------------------------------------------------------ */
/* AI (§4.7)                                                           */
/* ------------------------------------------------------------------ */

export interface ChatResponse {
  response: string;
  confidence?: number;
}

export interface PersonalizedRecommendationsDTO {
  personalized_rail_title?: string;
  listings: ListingDTO[];
}

export interface ReviewSummaryDTO {
  pros: string[];
  cons: string[];
  sentiment_score?: number;
}

/* ------------------------------------------------------------------ */
/* Reviews (real backend — §4.x / §5.2)                               */
/* ------------------------------------------------------------------ */

export interface ReviewDTO {
  id: string;
  booking_id?: string;
  user_id?: string;
  user_name?: string;
  user_avatar?: string;
  listing_id?: string;
  rating?: number;
  title?: string;
  comment?: string;
  photos?: string[];
  helpful_count?: number;
  ai_fraud_score?: number;
  status?: string;
  created_at?: string;
  supplier_reply?: { text?: string } | null;
}

export interface CreateReviewRequest {
  listing_id: string;
  rating: number;
  title?: string;
  comment: string;
  photos?: string[];
}

/* ------------------------------------------------------------------ */
/* Auth (planned — §5.1)                                               */
/* ------------------------------------------------------------------ */

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "supplier";
  avatar_emoji?: string;
  avatar_url?: string;
}

export interface AuthTokensDTO {
  access_token: string;
  refresh_token: string;
}

/* ------------------------------------------------------------------ */
/* App-facing shapes for availability                                  */
/* ------------------------------------------------------------------ */

export interface Slot {
  id: string;
  listingId: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  bookedCapacity: number;
  heldCapacity: number;
  remaining: number;
}

export interface Hold {
  holdId: string;
  expiresAt: number;
}

/* ------------------------------------------------------------------ */
/* Mappers                                                             */
/* ------------------------------------------------------------------ */

const CATEGORY_TONE: Record<CategoryId, ImageTone> = {
  attractions: "blue",
  tours: "orange",
  experiences: "purple",
  food: "rose",
  activities: "teal",
  transport: "slate",
};

/** Backend category ids (cat-*) → app CategoryId. Unknown ids fall through to name matching. */
const CATEGORY_BY_ID: Record<string, CategoryId> = {
  "cat-tickets": "attractions",
  "cat-things-to-do": "attractions",
  "cat-tours": "tours",
  "cat-transfers": "transport",
  "cat-rentals": "transport",
  "cat-food": "food",
  "cat-adventure": "activities",
  "cat-cruises": "activities",
  "cat-events": "activities",
  "cat-packages": "experiences",
};

function toCategoryId(categoryId?: string, categoryName?: string): CategoryId {
  if (categoryId && categoryId in CATEGORY_BY_ID) {
    return CATEGORY_BY_ID[categoryId];
  }
  const label = (categoryName ?? "").toLowerCase();
  if (/ticket|museum|attraction|monument|sight/.test(label)) return "attractions";
  if (/tour|walk|heritage|safari|trip|day trip/.test(label)) return "tours";
  if (/food|dining|drink|culinary|street food/.test(label)) return "food";
  if (/transport|transfer|rental|transit/.test(label)) return "transport";
  if (/adventure|cruise|outdoor|sport|water|activity/.test(label)) return "activities";
  if (/package|multi-day|bundle/.test(label)) return "experiences";
  return "experiences";
}

function formatDuration(minutes?: number): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** "dest-bali" → "Bali", "new-york" → "New York" — display fallback when no city/country is sent. */
function prettifySlug(value?: string): string {
  if (!value) return "";
  return value
    .replace(/^dest-/, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function mapPrice(amount: number, currency?: string): Price {
  const cur = (currency || "USD").toUpperCase();
  const display =
    cur === "USD" ? `$${amount.toFixed(2)}` : `${cur} ${amount.toFixed(2)}`;
  return {
    amount: Number.isFinite(amount) ? amount : 0,
    currency: (cur as Price["currency"]) || "USD",
    display,
  };
}

export function listingDtoToListing(dto: ListingDTO): Listing {
  const category = toCategoryId(dto.category_id ?? dto.category, dto.category_name);
  const currency = dto.currency ?? "USD";
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    category,
    destination:
      dto.destination ?? dto.city ?? dto.country ?? prettifySlug(dto.destination_id),
    city: dto.city ?? "",
    country: dto.country ?? "",
    images: (dto.images ?? []).map((img) => ({
      url: img.url,
      caption: img.alt,
    })),
    thumbnail: {
      key: dto.slug ?? dto.id,
      label: dto.title,
      emoji: categoryEmoji(category),
      tone: CATEGORY_TONE[category],
    },
    rating: dto.cached_rating_avg ?? 0,
    reviewCount: dto.cached_review_count ?? dto.review_count ?? 0,
    price: mapPrice(dto.base_price ?? 0, currency),
    duration: dto.duration ?? formatDuration(dto.duration_minutes),
    shortDescription: dto.summary ?? dto.short_description ?? dto.title,
    description: dto.description ?? dto.summary ?? dto.short_description ?? "",
    highlights: dto.highlights ?? [],
    includes: dto.inclusions ?? dto.includes ?? [],
    excludes: dto.exclusions ?? dto.excludes ?? [],
    itinerary: (dto.itinerary ?? []).map((s) => ({
      time: s.time,
      title: s.title,
      description: s.description,
    })),
    knowBeforeYouGo: dto.know_before_you_go ?? [],
    meetingPoint: dto.meeting_point
      ? {
          latitude: dto.meeting_point.latitude,
          longitude: dto.meeting_point.longitude,
          label: dto.meeting_point.address ?? "Meeting point",
        }
      : undefined,
    options: (dto.options ?? []).map((o) => ({
      id: o.id,
      name: o.name,
      price: mapPrice(o.price ?? dto.base_price ?? 0, o.currency ?? currency),
    })),
    freeCancellation:
      dto.free_cancellation ?? dto.cancellation_policy === "FREE_24H",
    instantConfirmation:
      dto.instant_confirmation ?? dto.confirmation_type === "INSTANT",
    supplierId: dto.supplier_id ?? "",
    tags: dto.tags ?? [],
    isTrending:
      dto.is_trending ?? (dto.merchandising_badges ?? []).includes("Bestseller"),
    isDeal: dto.is_deal ?? false,
    recommendedFor: dto.recommended_for ?? [],
    reviewSummary: dto.ai_review_summary
      ? {
          pros: dto.ai_review_summary.pros ?? [],
          cons: dto.ai_review_summary.cons ?? [],
          sentimentScore: dto.ai_review_summary.sentiment_score,
        }
      : undefined,
  };
}

export function slotDtoToSlot(dto: SlotDTO): Slot {
  return {
    id: dto.id,
    listingId: dto.listing_id,
    startTime: dto.start_time,
    endTime: dto.end_time,
    totalCapacity: dto.total_capacity,
    bookedCapacity: dto.booked_capacity,
    heldCapacity: dto.held_capacity,
    remaining: Math.max(
      0,
      dto.total_capacity - dto.booked_capacity - dto.held_capacity,
    ),
  };
}

export function mapBookingStatus(status?: string): BookingStatus {
  switch (status) {
    case "PENDING_PAYMENT":
    case "AWAITING_SUPPLIER_CONFIRMATION":
      return "pending";
    case "CONFIRMED":
      return "confirmed";
    case "CANCELLED":
    case "REFUNDED":
      return "cancelled";
    case "COMPLETED":
      return "completed";
    default:
      return "pending";
  }
}

export function bookingDtoToBooking(dto: BookingDTO): Booking {
  const currency = dto.currency ?? "USD";
  const travelers = Math.max(1, dto.total_travelers || 1);
  const unitAmount = dto.gross_amount / travelers;
  return {
    id: dto.id,
    bookingRef: dto.booking_reference,
    items: [
      {
        listingId: dto.listing_id,
        listingSlug: dto.listing_slug ?? "",
        title: dto.listing_title ?? dto.listing_id,
        thumbnailKey: dto.thumbnail_key ?? "",
        optionName: dto.option_name ?? "",
        date: dto.slot_start_time,
        quantity: dto.total_travelers,
        unitPrice: mapPrice(unitAmount, currency),
        total: mapPrice(dto.gross_amount, currency),
      },
    ],
    status: mapBookingStatus(dto.status),
    createdAt: dto.created_at,
    activityDate: dto.slot_start_time,
    travelers: [
      {
        id: "lead",
        name: dto.traveler_details?.lead_name ?? "",
        email: dto.traveler_details?.lead_email,
        phone: dto.traveler_details?.lead_phone,
      },
    ],
    total: mapPrice(dto.gross_amount, currency),
    voucherCode: dto.qr_voucher_code,
    qrToken: dto.qr_voucher_code,
    supplierId: dto.supplier_id ?? "",
  };
}

export function payoutLedgerToSummary(
  ledger: PayoutLedgerDTO,
  history: PayoutHistoryItemDTO[] = [],
): PayoutSummary {
  return {
    balance: mapPrice(ledger.net_earned_balance, ledger.currency),
    pending: mapPrice(ledger.pending_payout_balance, ledger.currency),
    history: history.map(
      (h): Payout => ({
        id: h.id,
        reference: h.reference,
        status: h.status,
        amount: mapPrice(h.amount, h.currency),
        period: h.period,
        paidAt: h.paid_at,
      }),
    ),
  };
}

export function userDtoToUser(dto: UserDTO): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    role: dto.role,
    avatarEmoji: dto.avatar_emoji ?? (dto.role === "supplier" ? "🏔️" : "🧳"),
    avatarUrl: dto.avatar_url,
  };
}

export function reviewSummaryDto(dto: ReviewSummaryDTO): ReviewSummary {
  return {
    pros: dto.pros ?? [],
    cons: dto.cons ?? [],
    sentimentScore: dto.sentiment_score,
  };
}

export function reviewDtoToReview(dto: ReviewDTO): Review {
  return {
    id: dto.id,
    listingId: dto.listing_id ?? "",
    authorName: dto.user_name ?? "Traveler",
    authorEmoji: "",
    avatarUrl: dto.user_avatar,
    rating: dto.rating ?? 0,
    title: dto.title ?? "",
    comment: dto.comment ?? "",
    photos: dto.photos ?? [],
    helpfulCount: dto.helpful_count ?? 0,
    date: dto.created_at ?? new Date().toISOString(),
    supplierReply: dto.supplier_reply?.text,
  };
}
