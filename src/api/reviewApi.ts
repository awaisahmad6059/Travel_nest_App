import { USE_MOCKS_REVIEWS } from "@/config";
import { request, mockDelay } from "./client";
import {
  CreateReviewRequest,
  ReviewDTO,
  reviewDtoToReview,
} from "./contracts";
import { MOCK_REVIEWS } from "@/mocks/reviews";
import type { Review } from "@/types";

export const reviewApi = {
  async getReviews(listingId: string): Promise<Review[]> {
    if (USE_MOCKS_REVIEWS) {
      return mockDelay(MOCK_REVIEWS.filter((r) => r.listingId === listingId));
    }
    const dtos = await request<ReviewDTO[]>(
      `/reviews?listing_id=${encodeURIComponent(listingId)}`,
    );
    return (dtos ?? []).map(reviewDtoToReview);
  },

  async createReview(payload: CreateReviewRequest): Promise<Review> {
    if (USE_MOCKS_REVIEWS) {
      const review: Review = {
        id: `rev_${Date.now()}`,
        listingId: payload.listing_id,
        authorName: "You",
        authorEmoji: "🧳",
        rating: payload.rating,
        title: payload.title ?? "",
        comment: payload.comment,
        date: new Date().toISOString(),
      };
      return mockDelay(review);
    }
    const dto = await request<ReviewDTO>("/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return reviewDtoToReview(dto);
  },

  async markHelpful(reviewId: string): Promise<void> {
    if (USE_MOCKS_REVIEWS) {
      return mockDelay(undefined, 300);
    }
    await request(`/reviews/${encodeURIComponent(reviewId)}/helpful`, {
      method: "POST",
    });
  },
};
