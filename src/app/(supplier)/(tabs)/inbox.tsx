import { useState } from "react";
import { Pressable, Text, TextInput, View, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { useSession } from "@/auth/sessionStore";
import {
  useBookingInbox,
  useConfirmBooking,
  useRejectBooking,
} from "@/features/supplier/useSupplier";
import { cn } from "@/utils/cn";
import { formatDate, formatPrice } from "@/utils/format";
import type { Booking, BookingStatus } from "@/types";

const FILTERS: { key: BookingStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function SupplierInboxScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { data, isLoading, isError, refetch } = useBookingInbox(user?.id ?? "");
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null);

  const confirmMutation = useConfirmBooking();
  const rejectMutation = useRejectBooking();

  const filtered = (data ?? []).filter((b) => filter === "all" || b.status === filter);
  const pendingCount = (data ?? []).filter((b) => b.status === "pending").length;

  function onConfirm(b: Booking) {
    confirmMutation.mutate(b.id);
  }

  function onReject(reason: string) {
    if (!rejectTarget) return;
    rejectMutation.mutate({ id: rejectTarget.id, reason });
    setRejectTarget(null);
  }

  return (
    <Screen className="bg-surface-100">
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-extrabold text-ink-900">Booking inbox</Text>
        <Text className="text-sm text-ink-500 mt-1">
          {pendingCount > 0 ? `${pendingCount} new booking${pendingCount > 1 ? "s" : ""} awaiting action` : "No pending bookings"}
        </Text>
      </View>

      {/* Filter chips */}
      <View className="px-5 flex-row gap-2 mb-4">
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-full border",
              filter === f.key ? "bg-brand-600 border-brand-600" : "bg-white border-ink-200",
            )}
          >
            <Text className={cn("text-sm font-semibold", filter === f.key ? "text-white" : "text-ink-600")}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View className="px-5 gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </View>
      ) : isError ? (
        <Pressable onPress={() => refetch()} className="mx-5 bg-white rounded-2xl border border-ink-100 p-6 items-center">
          <Text className="text-sm text-ink-500">Couldn't load bookings — tap to retry</Text>
        </Pressable>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="mail-open-outline" size={40} color="#c3cad4" />
              <Text className="mt-3 text-sm text-ink-400">No bookings in this view</Text>
            </View>
          }
          renderItem={({ item }) => {
            const pending = item.status === "pending";
            const busy = confirmMutation.isPending || rejectMutation.isPending;
            return (
              <View className="bg-white rounded-2xl border border-ink-100 p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-medium text-ink-400">{item.bookingRef}</Text>
                  <BookingStatusBadge status={item.status} />
                </View>
                <Pressable onPress={() => router.push(`/booking/${item.id}`)} className="mt-2">
                  <Text className="text-sm font-semibold text-ink-900">{item.items[0]?.title}</Text>
                  <Text className="text-xs text-ink-500 mt-0.5">
                    {item.items[0]?.optionName} · {formatDate(item.activityDate)}
                  </Text>
                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-xs text-ink-500">
                      {item.travelers.map((t) => t.name).join(", ")} · {item.items[0]?.quantity} pax
                    </Text>
                    <Text className="text-sm font-bold text-ink-900">{formatPrice(item.total)}</Text>
                  </View>
                </Pressable>
                {pending ? (
                  <View className="mt-3 flex-row gap-2">
                    <View className="flex-1">
                      <Button
                        title="Confirm"
                        variant="primary"
                        size="sm"
                        block
                        loading={busy}
                        onPress={() => onConfirm(item)}
                      />
                    </View>
                    <View className="flex-1">
                      <Button
                        title="Reject"
                        variant="outline-danger"
                        size="sm"
                        block
                        onPress={() => setRejectTarget(item)}
                      />
                    </View>
                  </View>
                ) : (
                  <Pressable className="mt-3" onPress={() => router.push(`/booking/${item.id}`)}>
                    <Text className="text-sm font-semibold text-brand-600">View details</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      )}

      {rejectTarget ? (
        <RejectModal
          booking={rejectTarget}
          submitting={rejectMutation.isPending}
          onCancel={() => setRejectTarget(null)}
          onSubmit={onReject}
        />
      ) : null}
    </Screen>
  );
}

function RejectModal({
  booking,
  submitting,
  onCancel,
  onSubmit,
}: {
  booking: Booking;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <View className="absolute inset-0 bg-black/40 justify-center px-6">
      <View className="bg-white rounded-3xl p-5">
        <Text className="text-lg font-bold text-ink-900">Reject booking {booking.bookingRef}?</Text>
        <Text className="text-sm text-ink-500 mt-1 leading-5">
          The traveller will be notified and refunded. Add a reason to help them out.
        </Text>
        <TextInput
          className="mt-4 h-24 rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900"
          placeholder="Reason (e.g. no availability)"
          multiline
          textAlignVertical="top"
          value={reason}
          onChangeText={setReason}
        />
        <View className="mt-4 flex-row gap-2">
          <View className="flex-1">
            <Button title="Cancel" variant="secondary" size="md" block onPress={onCancel} />
          </View>
          <View className="flex-1">
            <Button
              title="Reject"
              variant="danger"
              size="md"
              block
              loading={submitting}
              onPress={() => onSubmit(reason)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
