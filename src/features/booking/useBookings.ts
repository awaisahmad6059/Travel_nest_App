import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/api/bookingApi";
import { availabilityApi } from "@/api/availabilityApi";
import type { CreateBookingInput } from "@/types";

export function useMyBookings() {
  return useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingApi.getMyBookings,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingApi.getBooking(id),
  });
}

/** Real availability slots for a listing (API_HANDOFF.md §4.2). */
export function useSlots(listingId: string) {
  return useQuery({
    queryKey: ["slots", listingId],
    queryFn: () => availabilityApi.getSlots(listingId),
    staleTime: 60_000,
  });
}

/** Creates a booking and invalidates the My Bookings cache. */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingApi.createBooking(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}
