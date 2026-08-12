import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { TONE_BARS } from "@/mocks/placeholders";
import { listingApi } from "@/api/listingApi";
import { formatDate, formatPrice } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Booking } from "@/types";

/**
 * Booking row for the customer My Bookings list.
 */
export function BookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  const first = booking.items[0];

  const listingId = first?.listingId ?? "";
  const { data: listing } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => listingApi.getListing(listingId),
    enabled: !!listingId,
  });

  // Bookings created via the backend don't carry the image/thumbnail fields
  // (the checkout DTO only has the listing id). Fall back to the listing's
  // own thumbnail so the card shows a real image instead of a bare letter.
  const thumbnail = first?.thumbnail ?? listing?.thumbnail;
  const imageUrl = first?.imageUrl ?? listing?.images?.[0]?.url;

  const tone =
    TONE_BARS[
      (thumbnail?.tone ??
        (first?.thumbnailKey as keyof typeof TONE_BARS)) as keyof typeof TONE_BARS
    ] ?? "bg-ink-200";

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
        <View className="h-16 w-16 rounded-xl overflow-hidden bg-ink-200">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-full"
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : thumbnail ? (
            <View className={cn("flex-1 items-center justify-center", tone)}>
              <Text className="text-2xl leading-7">
                {thumbnail.emoji}
              </Text>
              <Text
                className="mt-0.5 px-1 text-center text-[9px] font-bold text-white"
                numberOfLines={1}
              >
                {thumbnail.label}
              </Text>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-2xl">{first?.title.slice(0, 1) ?? "🧾"}</Text>
            </View>
          )}
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
