import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";

import { bookingApi } from "@/api/bookingApi";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { QRCodePlaceholder } from "@/components/QRCodePlaceholder";
import { useBooking } from "@/features/booking/useBookings";
import { formatDate, formatPrice } from "@/utils/format";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: booking, isLoading } = useBooking(id);
  const [cancelling, setCancelling] = useState(false);

  async function requestCancel() {
    Alert.alert(
      "Cancel booking?",
      "A refund will be processed per the listing's cancellation policy.",
      [
        { text: "Keep booking", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await bookingApi.cancelBooking(id, "Customer request");
              Alert.alert("Cancellation requested", "We've sent your request to the supplier.");
            } catch (e) {
              Alert.alert("Something went wrong", "Please try again.");
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  }

  if (isLoading || !booking) {
    return (
      <SafeAreaView className="flex-1 bg-surface-100 p-5 gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-24 w-full" />
      </SafeAreaView>
    );
  }

  const first = booking.items[0];
  const hasVoucher = booking.status === "confirmed" && booking.voucherCode;

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <View className="flex-row items-center px-4 py-3 bg-surface-100">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#14181f" />
        </Pressable>
        <Text className="flex-1 text-center text-base font-bold text-ink-900">
          Booking details
        </Text>
        <View className="w-6" />
      </View>

      <View className="px-5 gap-5 pb-8">
        <View className="bg-white rounded-2xl border border-ink-100 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-ink-400 font-medium">{booking.bookingRef}</Text>
            <BookingStatusBadge status={booking.status} />
          </View>
          <Text className="mt-3 text-base font-bold text-ink-900">
            {first?.title}
          </Text>
          <Text className="mt-1 text-sm text-ink-500">
            {first?.optionName} · {formatDate(booking.activityDate)} · {first?.quantity} pax
          </Text>
          <Text className="mt-2 text-lg font-extrabold text-ink-900">
            {formatPrice(booking.total)}
          </Text>
          <Text className="mt-1 text-xs text-ink-400">
            Booked {formatDate(booking.createdAt)}
          </Text>
        </View>

        {hasVoucher ? (
          <View className="items-center bg-white rounded-2xl border border-ink-100 p-5">
            <Text className="text-sm font-bold text-ink-900 mb-3">
              E-voucher — save offline 📱
            </Text>
            <QRCodePlaceholder token={booking.qrToken} size={200} />
            <Text className="mt-3 text-xs text-ink-400">
              Show this code to the supplier to check in.
            </Text>
          </View>
        ) : null}

        <View className="bg-white rounded-2xl border border-ink-100 p-4 gap-2">
          <Text className="text-sm font-bold text-ink-900">Travellers</Text>
          {booking.travelers.map((t) => (
            <View key={t.id} className="flex-row items-center justify-between">
              <Text className="text-sm text-ink-700">{t.name}</Text>
              {t.email ? <Text className="text-xs text-ink-400">{t.email}</Text> : null}
            </View>
          ))}
        </View>

        {booking.status === "confirmed" ? (
          <Button
            title="Request cancellation"
            variant="secondary"
            loading={cancelling}
            onPress={requestCancel}
          />
        ) : null}

        <Button
          title="Chat with supplier"
          variant="ghost"
          onPress={() =>
            Alert.alert("Coming soon", "Booking chat is part of a later phase.")
          }
        />
      </View>
    </SafeAreaView>
  );
}
