import { useQuery } from "@tanstack/react-query";
import { listingApi } from "@/api/listingApi";

export function useHomeFeed() {
  return useQuery({
    queryKey: ["home-feed"],
    queryFn: listingApi.getHomeFeed,
  });
}
