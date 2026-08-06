import { useQuery } from "@tanstack/react-query";
import { listingApi } from "@/api/listingApi";

/** Fetches full listing objects for the currently saved wishlist ids. */
export function useWishlistListings(ids: string[]) {
  return useQuery({
    queryKey: ["wishlist", ids],
    queryFn: () => listingApi.getByIds(ids),
    enabled: ids.length > 0,
  });
}
