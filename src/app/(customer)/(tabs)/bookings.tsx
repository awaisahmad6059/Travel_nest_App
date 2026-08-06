import { useState } from "react";
import { Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookingCard } from "@/components/BookingCard";
import { useMyBookings } from "@/features/booking/useBookings";
import type { BookingStatus } from "@/types";

type Tab = "upcoming" | "completed" | "cancelled";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function MyBookingsScreen() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const { data, isLoading, isError, refetch } = useMyBookings();

  const bookings = data ?? [];

  function filterByTab(status: BookingStatus): boolean {
    switch (tab) {
      case "upcoming":
        return status === "pending" || status === "confirmed";
      case "completed":
        return status === "completed";
      case "cancelled":
        return status === "cancelled";
    }
  }

  const visible = bookings.filter((b) => filterByTab(b.status));

  return (
    <Screen className="bg-surface-100">
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-extrabold text-ink-900">My bookings</Text>
        <Text className="text-sm text-ink-500 mt-0.5">
          Vouchers stay available offline once loaded.
        </Text>
      </View>

      <View className="flex-row gap-2 px-5 pb-4">
        {TABS.map((t) => (
          <Chip
            key={t.id}
            label={t.label}
            selected={tab === t.id}
            onPress={() => setTab(t.id)}
          />
        ))}
      </View>

      {isLoading ? (
        <View className="px-5 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </View>
      ) : isError ? (
        <EmptyState emoji="📡" title="Couldn't load bookings" message="Please try again." />
      ) : visible.length === 0 ? (
        <EmptyState
          emoji="🧾"
          title={`No ${tab} bookings`}
          message={tab === "upcoming" ? "Browse experiences and book your next adventure." : "Nothing here yet."}
        />
      ) : (
        <View className="px-5 gap-4">
          {visible.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </View>
      )}
    </Screen>
  );
}
