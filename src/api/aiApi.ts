import { USE_MOCKS_AI } from "@/config";
import { request, mockDelay } from "./client";
import {
  ChatResponse,
  ReviewSummaryDTO,
  reviewSummaryDto,
} from "./contracts";
import type { ReviewSummary } from "@/types";

/**
 * AI concierge services (API_HANDOFF.md §4.7) — the mobile v1 subset.
 * Trip planner, semantic search, dynamic pricing etc. are deferred to web.
 */
export const aiApi = {
  /** Help / concierge chat. */
  async chat(message: string, locale = "en"): Promise<{ response: string; confidence?: number }> {
    if (USE_MOCKS_AI) {
      const canned =
        "You can cancel up to 24 hours before the activity for a full refund. Need anything else?";
      return mockDelay({ response: canned, confidence: 0.98 }, 700);
    }
    const dto = await request<ChatResponse>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, locale }),
    });
    return { response: dto.response, confidence: dto.confidence };
  },

  /** AI pros/cons summary for a listing detail page. */
  async reviewSummary(listingId: string): Promise<ReviewSummary> {
    if (USE_MOCKS_AI) {
      return mockDelay({ pros: [], cons: [] }, 400);
    }
    const dto = await request<ReviewSummaryDTO>(
      `/ai/review-summary/${encodeURIComponent(listingId)}`,
    );
    return reviewSummaryDto(dto);
  },

  /** Ask AI about a specific experience (listing-aware QA). */
  async contextualQA(
    listingId: string,
    question: string,
  ): Promise<{ answer: string }> {
    if (USE_MOCKS_AI) {
      return mockDelay(
        {
          answer:
            "You can cancel up to 24 hours before the activity for a full refund. Need anything else?",
        },
        700,
      );
    }
    return request<{ answer: string }>("/ai/contextual-qa", {
      method: "POST",
      body: JSON.stringify({ listing_id: listingId, question }),
    });
  },
};
