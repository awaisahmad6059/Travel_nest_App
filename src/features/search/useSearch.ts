import { useQuery } from "@tanstack/react-query";
import { listingApi } from "@/api/listingApi";
import type { SearchParams } from "@/types";

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ["search", params],
    queryFn: () => listingApi.search(params),
    placeholderData: (prev) => prev,
  });
}

export function useAutocomplete(query: string) {
  return useQuery({
    queryKey: ["autocomplete", query],
    queryFn: () => listingApi.autocomplete(query),
    enabled: query.trim().length > 0,
  });
}
