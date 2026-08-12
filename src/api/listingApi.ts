import { USE_MOCKS_LISTINGS } from "@/config";
import { request, mockDelay } from "./client";
import {
  DEAL_IDS,
  MOCK_DESTINATIONS,
  MOCK_DESTINATIONS_FEATURED,
  MOCK_LISTINGS,
  TRENDING_IDS,
} from "@/mocks/listings";
import {
  DestinationDTO,
  ListingDTO,
  PersonalizedRecommendationsDTO,
  listingDtoToListing,
} from "./contracts";
import type { Listing, SearchParams, SearchResult } from "@/types";

/**
 * Listings & discovery service (API_HANDOFF.md §4.1).
 *
 * Real branch is active while USE_MOCKS_LISTINGS is false. The backend has no
 * `is_trending`/`is_deal` flags, so the home rails are derived from the
 * `merchandising_badges` each listing returns (Bestseller / Likely to Sell
 * Out) and cheapest-first for the deals rail.
 */
export interface FeaturedDestination {
  slug: string;
  name: string;
  country: string;
}

export const listingApi = {
  async getHomeFeed(): Promise<{
    trending: Listing[];
    deals: Listing[];
    forYou: Listing[];
    topRated: Listing[];
    popular: Listing[];
    destinations: FeaturedDestination[];
  }> {
    if (USE_MOCKS_LISTINGS) {
      const trending = MOCK_LISTINGS.filter((l) => TRENDING_IDS.includes(l.id));
      const deals = MOCK_LISTINGS.filter((l) => DEAL_IDS.includes(l.id));
      const forYou = MOCK_LISTINGS.filter(
        (l) => !trending.includes(l) && !deals.includes(l),
      ).slice(0, 4);
      const topRated = [...MOCK_LISTINGS]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
      const popular = [...MOCK_LISTINGS]
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 6);
      const destinations = MOCK_DESTINATIONS_FEATURED.map((d) => ({
        slug: d.name.toLowerCase().replace(/\s+/g, "-"),
        name: d.name,
        country: d.country,
      }));
      return mockDelay({ trending, deals, forYou, topRated, popular, destinations });
    }
    // For You rail comes from the AI endpoint; trending/deals from /listings.
    let forYou: Listing[] = [];
    try {
      const recs = await request<PersonalizedRecommendationsDTO>(
        "/ai/personalized-recommendations?userId=guest",
      );
      forYou = (recs?.listings ?? []).map(listingDtoToListing);
    } catch {
      forYou = [];
    }
    const all = await request<ListingDTO[]>("/listings");
    const bestsellers = all.filter(
      (d) =>
        (d.merchandising_badges ?? []).includes("Bestseller") ||
        (d.merchandising_badges ?? []).includes("Likely to Sell Out"),
    );
    const trending = (bestsellers.length >= 3 ? bestsellers : all)
      .slice(0, 6)
      .map(listingDtoToListing);
    const deals = [...all]
      .sort((a, b) => a.base_price - b.base_price)
      .slice(0, 6)
      .map(listingDtoToListing);
    if (!forYou.length) {
      forYou = all.slice(0, 4).map(listingDtoToListing);
    }
    const topRated = [...all]
      .sort((a, b) => (b.cached_rating_avg ?? 0) - (a.cached_rating_avg ?? 0))
      .slice(0, 6)
      .map(listingDtoToListing);
    const popular = [...all]
      .sort(
        (a, b) =>
          (b.cached_review_count ?? b.review_count ?? 0) -
          (a.cached_review_count ?? a.review_count ?? 0),
      )
      .slice(0, 6)
      .map(listingDtoToListing);
    let destinations: FeaturedDestination[] = [];
    try {
      destinations = (await request<DestinationDTO[]>("/listings/destinations")).map(
        (d) => ({ slug: d.slug, name: d.name, country: d.country ?? "" }),
      );
    } catch {
      destinations = [];
    }
    return { trending, deals, forYou, topRated, popular, destinations };
  },

  async getListing(id: string): Promise<Listing | null> {
    if (USE_MOCKS_LISTINGS) {
      const listing = MOCK_LISTINGS.find((l) => l.id === id);
      return mockDelay(listing ?? null, 350);
    }
    const dto = await request<ListingDTO | null>(`/listings/${encodeURIComponent(id)}`);
    return dto ? listingDtoToListing(dto) : null;
  },

  async search(params: SearchParams): Promise<SearchResult> {
    let items: Listing[];
    if (USE_MOCKS_LISTINGS) {
      items = MOCK_LISTINGS;
    } else {
      const dtos = await request<ListingDTO[]>("/listings");
      items = dtos.map(listingDtoToListing);
    }
    items = applySearchFilters(items, params);
    return { items, total: items.length };
  },

  async autocomplete(query: string): Promise<{ destinations: string[]; listings: Listing[] }> {
    if (USE_MOCKS_LISTINGS) {
      const q = query.trim().toLowerCase();
      const destinations = q
        ? MOCK_DESTINATIONS.filter((d) => d.toLowerCase().includes(q))
        : MOCK_DESTINATIONS.slice(0, 6);
      const listings = q
        ? MOCK_LISTINGS.filter((l) => l.title.toLowerCase().includes(q)).slice(0, 4)
        : [];
      return mockDelay({ destinations, listings });
    }
    const q = query.trim().toLowerCase();
    const destinations = (await request<DestinationDTO[]>("/listings/destinations"))
      .map((d) => d.name)
      .filter((d) => !q || d.toLowerCase().includes(q))
      .slice(0, 6);
    const listings = q
      ? (await request<ListingDTO[]>(`/listings?search=${encodeURIComponent(query)}`))
          .slice(0, 4)
          .map(listingDtoToListing)
      : [];
    return { destinations, listings };
  },

  async getRelated(listingId: string): Promise<Listing[]> {
    if (USE_MOCKS_LISTINGS) {
      const current = MOCK_LISTINGS.find((l) => l.id === listingId);
      const sameCategory = MOCK_LISTINGS.filter(
        (l) => l.id !== listingId && l.category === current?.category,
      );
      return mockDelay(sameCategory.slice(0, 5));
    }
    const listing = await this.getListing(listingId);
    if (!listing) return [];
    const related = (await request<ListingDTO[]>("/listings"))
      .map(listingDtoToListing)
      .filter((l) => l.id !== listingId && l.category === listing.category)
      .slice(0, 5);
    return related;
  },

  async getByIds(ids: string[]): Promise<Listing[]> {
    if (USE_MOCKS_LISTINGS) {
      const items = MOCK_LISTINGS.filter((l) => ids.includes(l.id));
      return mockDelay(items);
    }
    const all = await request<ListingDTO[]>("/listings");
    return all
      .filter((d) => ids.includes(d.id))
      .map(listingDtoToListing);
  },
};

/**
 * Client-side search refinement, shared by mock and real modes. The real
 * backend returns the full /listings payload (a small catalog) so query,
 * category, price, rating and availability filters run here for consistency.
 */
function applySearchFilters(items: Listing[], params: SearchParams): Listing[] {
  const query = params.query?.trim().toLowerCase() ?? "";
  const city = params.city?.trim().toLowerCase() ?? "";
  const f = params.filters ?? {};

  // "Lahore, Pakistan" → ["lahore", "pakistan"]; plain "lahore" stays a
  // single token. A listing matches if ANY token matches one of its fields —
  // the backend stores the city in destination_id and the mapper exposes it
  // as `Listing.destination`, exactly what the Home card renders.
  const qTokens = query.split(",").map((t) => t.trim()).filter(Boolean);

  const matchesField = (l: Listing, tok: string) =>
    l.title.toLowerCase().includes(tok) ||
    l.shortDescription.toLowerCase().includes(tok) ||
    l.description.toLowerCase().includes(tok) ||
    l.city.toLowerCase().includes(tok) ||
    l.country.toLowerCase().includes(tok) ||
    l.destination.toLowerCase().includes(tok) ||
    l.tags.some((t) => t.toLowerCase().includes(tok));

  const qMatch = (l: Listing) => !query || qTokens.some((tok) => matchesField(l, tok));
  const cityMatch = (l: Listing) =>
    !city ||
    l.city.toLowerCase().includes(city) ||
    l.country.toLowerCase().includes(city);
  const categoryMatch = (l: Listing) => !f.category || l.category === f.category;
  const priceMatch = (l: Listing) =>
    (f.minPrice == null || l.price.amount >= f.minPrice) &&
    (f.maxPrice == null || l.price.amount <= f.maxPrice);
  const ratingMatch = (l: Listing) => f.minRating == null || l.rating >= f.minRating;
  const cancelMatch = (l: Listing) => !f.freeCancellation || l.freeCancellation;
  const instantMatch = (l: Listing) => !f.instantConfirmation || l.instantConfirmation;

  let result = items.filter(
    (l) =>
      qMatch(l) &&
      cityMatch(l) &&
      categoryMatch(l) &&
      priceMatch(l) &&
      ratingMatch(l) &&
      cancelMatch(l) &&
      instantMatch(l),
  );

  switch (params.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.price.amount - a.price.amount);
      break;
    case "rating":
      result = [...result].sort((a, b) => b.rating - a.rating);
      break;
    default:
      result = [...result].sort(
        (a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount,
      );
  }

  return result;
}
