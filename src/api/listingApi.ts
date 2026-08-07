import { USE_MOCKS } from "@/config";
import { request, mockDelay } from "./client";
import {
  DEAL_IDS,
  MOCK_DESTINATIONS,
  MOCK_LISTINGS,
  TRENDING_IDS,
} from "@/mocks/listings";
import {
  DestinationDTO,
  ListingDTO,
  listingDtoToListing,
} from "./contracts";
import type { Listing, SearchParams, SearchResult } from "@/types";

/**
 * Listings & discovery service (API_HANDOFF.md §4.1).
 *
 * Mock branch is active while USE_MOCKS is true. The real branch follows the
 * documented endpoints: `/listings`, `/listings/:slug`, `/listings/categories`,
 * `/listings/destinations` and `/ai/personalized-recommendations`.
 */
export const listingApi = {
  async getHomeFeed(): Promise<{ trending: Listing[]; deals: Listing[]; forYou: Listing[] }> {
    if (USE_MOCKS) {
      const trending = MOCK_LISTINGS.filter((l) => TRENDING_IDS.includes(l.id));
      const deals = MOCK_LISTINGS.filter((l) => DEAL_IDS.includes(l.id));
      const forYou = MOCK_LISTINGS.filter(
        (l) => !trending.includes(l) && !deals.includes(l),
      ).slice(0, 4);
      return mockDelay({ trending, deals, forYou });
    }
    // For You rail comes from the AI endpoint; trending/deals from /listings.
    let forYou: Listing[] = [];
    try {
      const recs = await request<{ listings: ListingDTO[] }>(
        "/ai/personalized-recommendations?userId=guest",
      );
      forYou = (recs?.listings ?? []).map(listingDtoToListing);
    } catch {
      forYou = [];
    }
    const all = await request<ListingDTO[]>("/listings");
    const trending = all
      .filter((d) => d.is_trending)
      .slice(0, 6)
      .map(listingDtoToListing);
    const deals = all
      .filter((d) => d.is_deal)
      .slice(0, 6)
      .map(listingDtoToListing);
    if (!forYou.length) {
      forYou = all.slice(0, 4).map(listingDtoToListing);
    }
    return { trending, deals, forYou };
  },

  async getListing(id: string): Promise<Listing | null> {
    if (USE_MOCKS) {
      const listing = MOCK_LISTINGS.find((l) => l.id === id);
      return mockDelay(listing ?? null, 350);
    }
    const dto = await request<ListingDTO | null>(`/listings/${encodeURIComponent(id)}`);
    return dto ? listingDtoToListing(dto) : null;
  },

  async search(params: SearchParams): Promise<SearchResult> {
    if (USE_MOCKS) {
      const query = params.query?.trim().toLowerCase() ?? "";
      const city = params.city?.trim().toLowerCase() ?? "";
      const f = params.filters ?? {};

      let items = MOCK_LISTINGS.filter((l) => {
        const qMatch =
          !query ||
          l.title.toLowerCase().includes(query) ||
          l.city.toLowerCase().includes(query) ||
          l.country.toLowerCase().includes(query) ||
          l.destination.toLowerCase().includes(query) ||
          l.tags.some((t) => t.toLowerCase().includes(query));
        const cityMatch =
          !city ||
          l.city.toLowerCase().includes(city) ||
          l.country.toLowerCase().includes(city);
        const categoryMatch = !f.category || l.category === f.category;
        const priceMatch =
          (f.minPrice == null || l.price.amount >= f.minPrice) &&
          (f.maxPrice == null || l.price.amount <= f.maxPrice);
        const ratingMatch = f.minRating == null || l.rating >= f.minRating;
        const cancelMatch = !f.freeCancellation || l.freeCancellation;
        const instantMatch = !f.instantConfirmation || l.instantConfirmation;
        return (
          qMatch &&
          cityMatch &&
          categoryMatch &&
          priceMatch &&
          ratingMatch &&
          cancelMatch &&
          instantMatch
        );
      });

      switch (params.sort) {
        case "price-asc":
          items = [...items].sort((a, b) => a.price.amount - b.price.amount);
          break;
        case "price-desc":
          items = [...items].sort((a, b) => b.price.amount - a.price.amount);
          break;
        case "rating":
          items = [...items].sort((a, b) => b.rating - a.rating);
          break;
        default:
          items = [...items].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
      }

      return mockDelay({ items, total: items.length });
    }
    const q = new URLSearchParams();
    if (params.query) q.set("search", params.query);
    if (params.city) q.set("destination", params.city);
    if (params.filters?.category) q.set("category", params.filters.category);
    const dtos = await request<ListingDTO[]>(`/listings?${q.toString()}`);
    let items = dtos.map(listingDtoToListing);

    // Client-side refinements for params the API does not cover yet.
    const f = params.filters ?? {};
    items = items.filter((l) => {
      const priceMatch =
        (f.minPrice == null || l.price.amount >= f.minPrice) &&
        (f.maxPrice == null || l.price.amount <= f.maxPrice);
      const ratingMatch = f.minRating == null || l.rating >= f.minRating;
      const cancelMatch = !f.freeCancellation || l.freeCancellation;
      const instantMatch = !f.instantConfirmation || l.instantConfirmation;
      return priceMatch && ratingMatch && cancelMatch && instantMatch;
    });
    switch (params.sort) {
      case "price-asc":
        items = [...items].sort((a, b) => a.price.amount - b.price.amount);
        break;
      case "price-desc":
        items = [...items].sort((a, b) => b.price.amount - a.price.amount);
        break;
      case "rating":
        items = [...items].sort((a, b) => b.rating - a.rating);
        break;
    }

    return { items, total: items.length };
  },

  async autocomplete(query: string): Promise<{ destinations: string[]; listings: Listing[] }> {
    if (USE_MOCKS) {
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
    const destinations = (
      await request<DestinationDTO[]>("/listings/destinations")
    )
      .map((d) => d.name)
      .filter((d) => !q || d.toLowerCase().includes(q))
      .slice(0, 6);
    const listings = q
      ? (
          await request<ListingDTO[]>(
            `/listings?search=${encodeURIComponent(query)}`,
          )
        )
          .slice(0, 4)
          .map(listingDtoToListing)
      : [];
    return { destinations, listings };
  },

  async getRelated(listingId: string): Promise<Listing[]> {
    if (USE_MOCKS) {
      const current = MOCK_LISTINGS.find((l) => l.id === listingId);
      const sameCategory = MOCK_LISTINGS.filter(
        (l) => l.id !== listingId && l.category === current?.category,
      );
      return mockDelay(sameCategory.slice(0, 5));
    }
    const listing = await this.getListing(listingId);
    if (!listing) return [];
    const dtos = await request<ListingDTO[]>(
      `/listings?category=${encodeURIComponent(listing.category)}`,
    );
    return dtos
      .filter((d) => d.id !== listingId)
      .slice(0, 5)
      .map(listingDtoToListing);
  },

  async getByIds(ids: string[]): Promise<Listing[]> {
    if (USE_MOCKS) {
      const items = MOCK_LISTINGS.filter((l) => ids.includes(l.id));
      return mockDelay(items);
    }
    const all = await request<ListingDTO[]>("/listings");
    return all
      .filter((d) => ids.includes(d.id))
      .map(listingDtoToListing);
  },
};
