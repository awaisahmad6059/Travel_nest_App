import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { QRCodePlaceholder } from "@/components/QRCodePlaceholder";
import { DEMO_SUPPLIER_ID } from "@/constants/demo";
import {
  useBookingInbox,
  useConfirmBooking,
  useRejectBooking,
} from "@/features/supplier/useSupplier";
import { formatDate, formatPrice } from "@/utils/format";

export default function SupplierBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useBookingInbox(DEMO_SUPPLIER_ID);
  const [showReject, setShowReject] = useState(false);

  const booking = data?.find((b) => b.id === id);
  const confirmMutation = useConfirmBooking();
  const rejectMutation = useRejectBooking();

  if (isLoading || !data) {
    return (
      <SafeAreaView className="flex-1 bg-surface-100 px-5 pt-4">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full mt-4" />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-surface-100 items-center justify-center px-6">
        <Text className="text-base font-semibold text-ink-900">Booking not found</Text>
        <Button title="Back to inbox" variant="secondary" size="md" onPress={() => router.back()} className="mt-4" />
      </SafeAreaView>
    );
  }

  const pending = booking.status === "pending";
  const busy = confirmMutation.isPending || rejectMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#14181f" />
        </Pressable>
        <Text className="flex-1 text-center text-base font-bold text-ink-900">Booking details</Text>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-10 gap-4">
        <View className="bg-brand-600 rounded-2xl p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-2xl font-extrabold tracking-wide">{booking.bookingRef}</Text>
            <View className="bg-white/20 rounded-full px-3 py-1">
              <Text className="text-xs font-bold text-white uppercase tracking-wide">
                {booking.status}
              </Text>
            </View>
          </View>
          <Text className="text-white/80 text-sm mt-2">
            Booked {formatDate(booking.createdAt)} · Activity {formatDate(booking.activityDate)}
          </Text>
        </View>

        <View className="bg-white rounded-2xl border border-ink-100 p-4 gap-2">
          <Text className="text-sm font-bold text-ink-900">Trip details</Text>
          {booking.items.map((item) => (
            <View key={`${item.listingId}-${item.optionName}`} className="gap-1">
              <Text className="text-sm font-semibold text-ink-900">{item.title}</Text>
              <Text className="text-xs text-ink-500">{item.optionName} · {formatDate(item.date)} · {item.quantity} pax</Text>
              <Text className="text-sm font-bold text-ink-900">{formatPrice(item.total)}</Text>
            </View>
          ))}
        </View>

        <View className="bg-white rounded-2xl border border-ink-100 p-4">
          <Text className="text-sm font-bold text-ink-900 mb-2">Travellers</Text>
          {booking.travelers.map((t) => (
            <View key={t.id} className="flex-row items-center gap-2 py-1">
              <Ionicons name="person-outline" size={16} color="#0a54d9" />
              <Text className="text-sm text-ink-700">{t.name}</Text>
              {t.email ? <Text className="text-xs text-ink-400">{t.email}</Text> : null}
            </View>
          ))}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-ink-100">
            <Text className="text-sm font-bold text-ink-900">Total paid</Text>
            <Text className="text-lg font-extrabold text-ink-900">{formatPrice(booking.total)}</Text>
          </View>
        </View>

        {booking.status === "confirmed" || booking.status === "completed" ? (
          <View className="bg-white rounded-2xl border border-ink-100 p-4 items-center">
            <Text className="text-sm font-bold text-ink-900 mb-3">Customer voucher</Text>
            <QRCodePlaceholder token={booking.qrToken} size={120} />
            <Text className="mt-3 text-xs font-mono text-ink-500">{booking.voucherCode}</Text>
            <Text className="text-[11px] text-ink-400 mt-1 text-center">
              Scan this at check-in to validate the booking.
            </Text>
          </View>
        ) : null}

        {pending ? (
          <View className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <Text className="text-sm font-semibold text-amber-900 mb-1">Awaiting your confirmation</Text>
            <Text className="text-xs text-amber-800 leading-5">
              Confirm to lock in the booking and release the voucher to the traveller.
            </Text>
            <View className="mt-4 flex-row gap-2">
              <View className="flex-1">
                <Button
                  title="Confirm booking"
                  size="md"
                  block
                  loading={busy}
                  onPress={() => confirmMutation.mutate(booking.id)}
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Reject"
                  variant="outline-danger"
                  size="md"
                  block
                  onPress={() => setShowReject(true)}
                />
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {showReject ? (
        <View className="absolute inset-0 bg-black/40 justify-center px-6">
          <RejectForm
            bookingRef={booking.bookingRef}
            submitting={rejectMutation.isPending}
            onCancel={() => setShowReject(false)}
            onSubmit={(reason) => {
              rejectMutation.mutate({ id: booking.id, reason });
              setShowReject(false);
            }}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function RejectForm({
  bookingRef,
  submitting,
  onCancel,
  onSubmit,
}: {
  bookingRef: string;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <View className="bg-white rounded-3xl p-5">
      <Text className="text-lg font-bold text-ink-900">Reject {bookingRef}?</Text>
      <Text className="text-sm text-ink-500 mt-1 leading-5">
        The traveller will be notified and refunded.
      </Text>
      <TextInput
        className="mt-4 h-24 rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900"
        placeholder="Reason (e.g. weather, no availability)"
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
  );
}
