import { USE_MOCKS_REVIEWS } from "@/config";
import { request, mockDelay } from "./client";
import { MOCK_REVIEWS } from "@/mocks/reviews";
import type { Review } from "@/types";

export const reviewApi = {
  async getReviews(listingId: string): Promise<Review[]> {
    if (USE_MOCKS_REVIEWS) {
      return mockDelay(MOCK_REVIEWS.filter((r) => r.listingId === listingId));
    }
    // Planned: GET /listings/:id/reviews (§5.2)
    return request(`/listings/${listingId}/reviews`);
  },
};
