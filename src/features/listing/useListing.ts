import { useQuery } from "@tanstack/react-query";
import { listingApi } from "@/api/listingApi";

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
