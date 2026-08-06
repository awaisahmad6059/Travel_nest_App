import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supplierApi } from "@/api/supplierApi";
import { reviewApi } from "@/api/reviewApi";

export function useSupplierDashboard(supplierId: string) {
  return useQuery({
    queryKey: ["supplier-dashboard", supplierId],
    queryFn: () => supplierApi.getDashboard(supplierId),
  });
}

export function useBookingInbox(supplierId: string) {
  return useQuery({
    queryKey: ["supplier-inbox", supplierId],
    queryFn: () => supplierApi.getBookingInbox(supplierId),
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierApi.confirmBooking(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["supplier-inbox"] });
      void queryClient.invalidateQueries({ queryKey: ["supplier-dashboard"] });
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      supplierApi.rejectBooking(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["supplier-inbox"] });
      void queryClient.invalidateQueries({ queryKey: ["supplier-dashboard"] });
    },
  });
}

export function usePayouts(supplierId: string) {
  return useQuery({
    queryKey: ["supplier-payouts", supplierId],
    queryFn: () => supplierApi.getPayouts(supplierId),
  });
}

export function useListingReviews(listingId: string) {
  return useQuery({
    queryKey: ["reviews", listingId],
    queryFn: () => reviewApi.getReviews(listingId),
  });
}
