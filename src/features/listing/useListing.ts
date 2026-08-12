import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listingApi } from "@/api/listingApi";
import { reviewApi } from "@/api/reviewApi";
import { aiApi } from "@/api/aiApi";
import type { CreateReviewRequest } from "@/api/contracts";

export function useListing(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingApi.getListing(id),
  });
}

export function useRelatedListings(id: string) {
  return useQuery({
    queryKey: ["listing-related", id],
    queryFn: () => listingApi.getRelated(id),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewRequest) => reviewApi.createReview(payload),
    onSuccess: (_data, payload) => {
      void queryClient.invalidateQueries({ queryKey: ["reviews", payload.listing_id] });
      void queryClient.invalidateQueries({ queryKey: ["listing", payload.listing_id] });
    },
  });
}

export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => reviewApi.markHelpful(reviewId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useContextualQA() {
  return useMutation({
    mutationFn: ({ listingId, question }: { listingId: string; question: string }) =>
      aiApi.contextualQA(listingId, question),
  });
}
