import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "@/components/ui/SafeAreaView";

import { useBooking } from "@/features/booking/useBookings";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

function BookingCard({ id }: { id: string }) {
  const { data: booking, isLoading } = useBooking(id);

  if (isLoading || !booking) {
    return (
      <View className="bg-white rounded-2xl border border-ink-100 p-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-4 w-56" />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl border border-ink-100 p-5">
      <Text className="text-xs text-ink-400">Booking reference</Text>
      <Text className="mt-1 text-lg font-extrabold text-ink-900 tracking-wide">
        {booking.bookingRef}
      </Text>
      <Text className="mt-2 text-sm text-ink-500">
        {booking.items[0]?.title} · {booking.items[0]?.optionName}
      </Text>
    </View>
  );
}

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{ bookingIds?: string; bookingId?: string }>();
  const router = useRouter();

  const ids = useMemo(() => {
    const raw = Array.isArray(params.bookingIds)
      ? params.bookingIds[0]
      : params.bookingIds;
    const fallback = Array.isArray(params.bookingId)
      ? params.bookingId[0]
      : params.bookingId;
    const source = (raw ?? fallback ?? "") as string;
    return source
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }, [params.bookingIds, params.bookingId]);

  const firstId = ids[0] ?? "";

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <View className="h-24 w-24 rounded-full bg-success-50 items-center justify-center">
            <Text className="text-5xl">🎉</Text>
          </View>
          <Text className="mt-5 text-2xl font-extrabold text-ink-900">
            {ids.length > 1
              ? `${ids.length} bookings confirmed!`
              : "Booking confirmed!"}
          </Text>
          <Text className="mt-2 text-center text-sm text-ink-500 leading-6">
            {ids.length > 1
              ? "Your e-vouchers are saved to My Bookings and available offline."
              : "Your e-voucher is saved to My Bookings and available offline."}
          </Text>
        </View>

        <View className="gap-3 mb-8">
          {ids.map((id) => (
            <BookingCard key={id} id={id} />
          ))}
        </View>

        <View className="gap-3">
          <Button
            title="View my voucher"
            size="lg"
            block
            disabled={!firstId}
            onPress={() => router.replace(`/booking/${firstId}`)}
          />
          <Button
            title="Back to home"
            variant="secondary"
            size="lg"
            block
            onPress={() => router.replace("/")}
          />
          <Pressable onPress={() => router.replace("/bookings")}>
            <Text className="text-center text-sm font-semibold text-brand-600 mt-1">
              Go to My bookings
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
