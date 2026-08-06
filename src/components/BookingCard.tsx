import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { TONE_BARS } from "@/mocks/placeholders";
import { formatDate, formatPrice } from "@/utils/format";
import type { Booking } from "@/types";

/**
 * Booking row for the customer My Bookings list.
 */
export function BookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  const first = booking.items[0];

  return (
    <Pressable
      onPress={() => router.push(`/booking/${booking.id}`)}
      className="bg-white rounded-2xl border border-ink-100 p-4 active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-ink-400 font-medium">
          {booking.bookingRef}
        </Text>
        <BookingStatusBadge status={booking.status} />
      </View>

      <View className="mt-3 flex-row gap-3">
        <View
          className={`h-16 w-16 rounded-xl items-center justify-center ${TONE_BARS[first?.thumbnailKey as keyof typeof TONE_BARS] ?? "bg-ink-200"}`}
        >
          <Text className="text-2xl">{first?.title.slice(0, 1) ?? "🧾"}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-ink-900" numberOfLines={2}>
            {first?.title}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color="#848d9c" />
            <Text className="text-xs text-ink-500">
              {formatDate(booking.activityDate)}
              {booking.items.length > 1 ? ` · +${booking.items.length - 1} more` : ""}
            </Text>
          </View>
          <Text className="mt-1 text-sm font-bold text-ink-900">
            {formatPrice(booking.total)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
