import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/ui/Screen";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { useSession } from "@/auth/sessionStore";
import { DEMO_SUPPLIER_ID } from "@/constants/demo";
import { useSupplierDashboard } from "@/features/supplier/useSupplier";
import { formatDate, formatPrice } from "@/utils/format";

export default function SupplierDashboardScreen() {
  const router = useRouter();
  const { user } = useSession();
  const { data, isLoading, isError, refetch } = useSupplierDashboard(DEMO_SUPPLIER_ID);

  const supplierName = user?.name ?? "Your business";

  return (
    <Screen className="bg-surface-100">
      {/* Header */}
      <View className="bg-brand-600 rounded-b-3xl px-5 pt-4 pb-6">
        <Text className="text-white text-xl font-extrabold">Supplier dashboard</Text>
        <Text className="text-white/80 text-sm mt-1">Good day, {supplierName.split(" ")[0]} 👋</Text>
        <Pressable
          onPress={() => router.push("/availability")}
          className="mt-4 flex-row items-center justify-between bg-white/15 rounded-2xl px-4 py-3"
        >
          <Text className="text-white text-sm font-semibold">Quick-block a date/slot</Text>
          <Ionicons name="calendar-outline" size={18} color="#ffffff" />
        </Pressable>
      </View>

      {/* Stats */}
      <View className="px-5 -mt-4">
        {isLoading ? (
          <View className="flex-row flex-wrap gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 flex-1 min-w-[45%]" />
            ))}
          </View>
        ) : isError || !data ? (
          <Pressable onPress={() => refetch()} className="bg-white rounded-2xl border border-ink-100 p-6 items-center">
            <Text className="text-sm text-ink-500">Couldn't load dashboard — tap to retry</Text>
          </Pressable>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            <StatCard label="Today's bookings" value={String(data.stats.todayBookings)} icon="today-outline" tone="brand" />
            <StatCard label="Upcoming check-ins" value={String(data.stats.upcomingCheckIns)} icon="scan-outline" tone="accent" />
            <StatCard label="Pending confirmations" value={String(data.stats.pendingConfirmations)} icon="time-outline" tone="warning" />
            <StatCard label="Revenue this month" value={formatPrice(data.stats.monthRevenue)} icon="cash-outline" tone="success" />
            <StatCard label="Average rating" value={data.stats.averageRating.toFixed(1)} icon="star-outline" tone="neutral" />
          </View>
        )}
      </View>

      {/* Recent bookings */}
      <View className="px-5 mt-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-ink-900">Recent bookings</Text>
          <Pressable onPress={() => router.push("/inbox")}>
            <Text className="text-sm font-semibold text-brand-600">View all</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <View className="gap-3">
            {(data?.recentBookings ?? []).map((b) => (
              <Pressable
                key={b.id}
                onPress={() => router.push(`/booking/${b.id}`)}
                className="bg-white rounded-2xl border border-ink-100 p-4 active:opacity-80"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-ink-400 font-medium">{b.bookingRef}</Text>
                  <BookingStatusBadge status={b.status} />
                </View>
                <Text className="mt-2 text-sm font-semibold text-ink-900">
                  {b.items[0]?.title}
                </Text>
                <View className="mt-1 flex-row items-center justify-between">
                  <Text className="text-xs text-ink-500">
                    {b.travelers.map((t) => t.name).join(", ")} · {formatDate(b.activityDate)}
                  </Text>
                  <Text className="text-sm font-bold text-ink-900">{formatPrice(b.total)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "brand" | "accent" | "warning" | "success" | "neutral";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    accent: "bg-accent-50 text-accent-700",
    warning: "bg-amber-50 text-amber-700",
    success: "bg-success-50 text-success-600",
    neutral: "bg-ink-100 text-ink-700",
  };
  return (
    <View className="flex-1 min-w-[45%] bg-white rounded-2xl border border-ink-100 p-4">
      <View className={`h-8 w-8 rounded-lg items-center justify-center ${tones[tone]}`}>
        <Ionicons name={icon} size={16} color="#0a54d9" />
      </View>
      <Text className="mt-2.5 text-xl font-extrabold text-ink-900">{value}</Text>
      <Text className="text-xs text-ink-500 mt-0.5">{label}</Text>
    </View>
  );
}
