import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBooking } from "@/features/booking/useBookings";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ConfirmationScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { data: booking, isLoading } = useBooking(bookingId);

  return (
    <SafeAreaView className="flex-1 bg-surface-100 justify-center px-6">
      <View className="items-center mb-8">
        <View className="h-24 w-24 rounded-full bg-success-50 items-center justify-center">
          <Text className="text-5xl">🎉</Text>
        </View>
        <Text className="mt-5 text-2xl font-extrabold text-ink-900">
          Booking confirmed!
        </Text>
        <Text className="mt-2 text-center text-sm text-ink-500 leading-6">
          Your e-voucher is saved to My Bookings and available offline.
          {booking?.supplierName ? `\n${booking.supplierName} has been notified.` : ""}
        </Text>
      </View>

      <View className="bg-white rounded-2xl border border-ink-100 p-5 mb-8">
        {isLoading || !booking ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            <Text className="text-xs text-ink-400">Booking reference</Text>
            <Text className="mt-1 text-xl font-extrabold text-ink-900 tracking-wide">
              {booking.bookingRef}
            </Text>
            <Text className="mt-2 text-sm text-ink-500">
              {booking.items[0]?.title} · {booking.items[0]?.optionName}
            </Text>
          </>
        )}
      </View>

      <View className="gap-3">
        <Button
          title="View my voucher"
          size="lg"
          block
          onPress={() => router.replace(`/booking/${bookingId}`)}
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
    </SafeAreaView>
  );
}
