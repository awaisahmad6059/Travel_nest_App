import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client. Server-state hooks (home feed, search, bookings,
 * dashboard) use this so that swapping mock services for real API calls later
 * keeps caching/retry/stale-time behaviour identical.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});
