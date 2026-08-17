import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "@/components/ui/SafeAreaView";

import { useBooking } from "@/features/booking/useBookings";
import { downloadBookingPdf } from "@/features/booking/voucherPdf";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Booking } from "@/types";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format";

function StatusBadge({ status }: { status: Booking["status"] }) {
  const confirmed = status === "confirmed";
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: confirmed ? "#d1fae5" : "#fffbeb",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: "800",
          letterSpacing: 0.6,
          color: confirmed ? "#047857" : "#b45309",
        }}
      >
        {confirmed ? "INSTANT VOUCHER CONFIRMED" : `AWAITING 24H SLA`}
      </Text>
    </View>
  );
}

function Field({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <View className="w-[48%] mb-4">
      <Text className="text-[11px] text-ink-400 uppercase tracking-wider">{label}</Text>
      <Text
        className={cn("mt-1 text-sm font-extrabold text-ink-900", valueClass)}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function VoucherCard({
  booking,
  onPress,
  onDownload,
  downloading,
}: {
  booking: Booking;
  onPress: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  const item = booking.items[0];
  const lead = booking.travelers[0];
  const confirmed = booking.status === "confirmed";
  const [copied, setCopied] = useState(false);

  async function copyRef() {
    await Clipboard.setStringAsync(booking.bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Pressable onPress={onPress} className="bg-surface-100 rounded-2xl border border-ink-100 p-5">
      <View className="flex-row items-start justify-between gap-4 border-b border-ink-100 pb-4 mb-4">
        <View className="flex-1">
          <StatusBadge status={booking.status} />
          <Text className="mt-2 text-lg font-bold text-ink-900">
            {item?.optionName ?? item?.title ?? "VIP Package"}
          </Text>
          <Text className="mt-1 text-xs text-ink-500">
            Lead Guest: <Text className="font-bold text-ink-900">{lead?.name}</Text>
            {lead?.phone ? ` (${lead.phone})` : ""}
          </Text>
        </View>
        <Pressable
          onPress={copyRef}
          className="items-center bg-white rounded-xl border border-ink-200 px-4 py-3"
        >
          <Text className="text-[10px] text-ink-400 uppercase tracking-wider font-semibold mb-1">
            Booking Reference
          </Text>
          <Text className="text-lg font-extrabold text-brand-600 tracking-wide">
            {booking.bookingRef}
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons
              name={copied ? "checkmark-circle" : "copy-outline"}
              size={14}
              color={copied ? "#059669" : "#0a54d9"}
            />
            <Text className="text-[10px] font-semibold" style={{ color: copied ? "#059669" : "#0a54d9" }}>
              {copied ? "Copied!" : "Tap to copy"}
            </Text>
          </View>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap justify-between">
        <Field label="Booking Reference" value={booking.bookingRef} valueClass="text-brand-600" />
        <Field label="Total Amount Paid" value={formatPrice(booking.total)} />
        <Field label="Guests" value={`${booking.travelers.length} Travelers`} />
        <View className="w-[48%] mb-4">
          <Text className="text-[11px] text-ink-400 uppercase tracking-wider">Status</Text>
          <View
            style={{
              alignSelf: "flex-start",
              marginTop: 4,
              backgroundColor: confirmed ? "#d1fae5" : "#fffbeb",
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: confirmed ? "#047857" : "#b45309",
              }}
            >
              {booking.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onDownload}
        disabled={downloading}
        className="mt-1 flex-row items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 active:bg-ink-50"
      >
        <Ionicons name="download-outline" size={18} color="#14181f" />
        <Text className="text-sm font-semibold text-ink-900">
          {downloading ? "Preparing PDF…" : "Download Printable PDF Pass"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{ bookingIds?: string; bookingId?: string }>();
  const router = useRouter();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

  async function download(booking: Booking) {
    setDownloadingId(booking.id);
    try {
      await downloadBookingPdf(booking);
    } catch (e) {
      Alert.alert(
        "Couldn't create PDF",
        e instanceof Error ? e.message : "Please try again.",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <ScrollView contentContainerClassName="px-6 py-8" showsVerticalScrollIndicator={false}>
        <View className="h-[70px] w-[70px] rounded-full bg-success-50 items-center justify-center self-center">
          <Ionicons name="checkmark" size={44} color="#059669" />
        </View>

        <Text className="mt-5 text-center text-[28px] font-extrabold text-ink-900">
          {ids.length > 1 ? `${ids.length} bookings confirmed!` : "Booking Confirmed!"}
        </Text>
        <Text className="mt-2 mb-8 text-center text-sm text-ink-500 leading-6">
          {ids.length > 1
            ? "Your electronic vouchers have been dispatched. Each voucher is also saved to My Bookings and available offline."
            : "Your electronic voucher has been dispatched to your email and saved to My Bookings."}
        </Text>

        {ids.length === 0 ? (
          <View className="gap-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </View>
        ) : (
          <View className="gap-5">
            {ids.map((id) => (
              <BookingCard
                key={id}
                id={id}
                onDownload={download}
                downloadingId={downloadingId}
                onOpen={(booking) => router.push(`/booking/${booking.id}`)}
              />
            ))}
          </View>
        )}

        {firstId ? (
          <View className="mt-8 gap-3">
            <Button
              title="Add to Apple / Google Wallet"
              variant="secondary"
              size="lg"
              block
              onPress={() =>
                Alert.alert("Add to Wallet", "Voucher token added to your Wallet pass.")
              }
            />
            <Button
              title="Return to Storefront"
              size="lg"
              block
              onPress={() => router.replace("/")}
            />
            <Pressable onPress={() => router.replace("/bookings")}>
              <Text className="mt-1 text-center text-sm font-semibold text-brand-600">
                Go to My bookings
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function BookingCard({
  id,
  downloadingId,
  onDownload,
  onOpen,
}: {
  id: string;
  downloadingId: string | null;
  onDownload: (booking: Booking) => void;
  onOpen: (booking: Booking) => void;
}) {
  const { data: booking, isLoading } = useBooking(id);

  if (isLoading || !booking) {
    return (
      <View className="bg-white rounded-2xl border border-ink-100 p-5 gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-32 w-full" />
      </View>
    );
  }

  return (
    <VoucherCard
      booking={booking}
      onPress={() => onOpen(booking)}
      onDownload={() => onDownload(booking)}
      downloading={downloadingId === booking.id}
    />
  );
}
