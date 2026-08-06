import { USE_MOCKS } from "@/config";
import { request, mockDelay } from "./client";
import {
  DEAL_IDS,
  MOCK_DESTINATIONS,
  MOCK_LISTINGS,
  TRENDING_IDS,
} from "@/mocks/listings";
import type {
  Listing,
  SearchParams,
  SearchResult,
} from "@/types";

/**
 * Listings & discovery service. Mock branch is active while USE_MOCKS is true.
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
    return request("/home-feed");
  },

  async getListing(id: string): Promise<Listing | null> {
    if (USE_MOCKS) {
      const listing = MOCK_LISTINGS.find((l) => l.id === id);
      return mockDelay(listing ?? null, 350);
    }
    return request(`/listings/${id}`);
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
        const dateMatch = !f.date || !l.freeCancellation;
        return (
          qMatch &&
          cityMatch &&
          categoryMatch &&
          priceMatch &&
          ratingMatch &&
          cancelMatch &&
          instantMatch &&
          dateMatch
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
    const query = new URLSearchParams({
      q: params.query ?? "",
      city: params.city ?? "",
      ...(params.filters ? { filters: JSON.stringify(params.filters) } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
    });
    return request(`/listings?${query.toString()}`);
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
    return request(`/search/suggest?q=${encodeURIComponent(query)}`);
  },

  async getRelated(listingId: string): Promise<Listing[]> {
    if (USE_MOCKS) {
      const current = MOCK_LISTINGS.find((l) => l.id === listingId);
      const sameCategory = MOCK_LISTINGS.filter(
        (l) => l.id !== listingId && l.category === current?.category,
      );
      return mockDelay(sameCategory.slice(0, 5));
    }
    return request(`/listings/${listingId}/related`);
  },

  async getByIds(ids: string[]): Promise<Listing[]> {
    if (USE_MOCKS) {
      const items = MOCK_LISTINGS.filter((l) => ids.includes(l.id));
      return mockDelay(items);
    }
    const query = ids.map((i) => `ids=${encodeURIComponent(i)}`).join("&");
    return request(`/listings?${query}`);
  },
};
