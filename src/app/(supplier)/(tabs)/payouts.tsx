import { Pressable, Text, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/ui/Screen";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSession } from "@/auth/sessionStore";
import { usePayouts } from "@/features/supplier/useSupplier";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format";
import type { Payout } from "@/types";

const STATUS_STYLES: Record<Payout["status"], { label: string; dot: string }> = {
  scheduled: { label: "Scheduled", dot: "bg-ink-300" },
  processing: { label: "Processing", dot: "bg-amber-400" },
  paid: { label: "Paid", dot: "bg-success-500" },
  failed: { label: "Failed", dot: "bg-danger-500" },
};

export default function SupplierPayoutsScreen() {
  const { user } = useSession();
  const { data, isLoading, isError, refetch } = usePayouts(user?.id ?? "");

  return (
    <Screen className="bg-surface-100">
      <View className="px-5 pt-4 pb-4">
        <Text className="text-2xl font-extrabold text-ink-900">Payouts</Text>
        <Text className="text-sm text-ink-500 mt-1">Your earnings at a glance</Text>
      </View>

      {isLoading ? (
        <View className="px-5 gap-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-52 w-full" />
        </View>
      ) : isError || !data ? (
        <Pressable onPress={() => refetch()} className="mx-5 bg-white rounded-2xl border border-ink-100 p-6 items-center">
          <Text className="text-sm text-ink-500">Couldn't load payouts — tap to retry</Text>
        </Pressable>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-10 gap-4">
          <View className="bg-brand-600 rounded-2xl p-5">
            <Text className="text-white/80 text-sm">Available balance</Text>
            <Text className="text-white text-3xl font-extrabold mt-1">
              {formatPrice(data.balance)}
            </Text>
            <Text className="text-white/80 text-xs mt-3">
              {formatPrice(data.pending)} pending · pays out on the next cycle
            </Text>
            <Pressable className="mt-4 bg-white rounded-xl py-3 items-center active:opacity-80">
              <Text className="text-brand-600 text-sm font-bold">Request payout</Text>
            </Pressable>
          </View>

          <View>
            <Text className="text-base font-bold text-ink-900 mb-3">Payout history</Text>
            <View className="gap-2">
              {data.history.map((p) => (
                <View key={p.id} className="bg-white rounded-2xl border border-ink-100 p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-ink-900">{p.period}</Text>
                    <Text className="text-sm font-bold text-ink-900">{formatPrice(p.amount)}</Text>
                  </View>
                  <View className="mt-1.5 flex-row items-center justify-between">
                    <Text className="text-xs text-ink-400">{p.reference}</Text>
                    <View className="flex-row items-center gap-1.5">
                      <View className={cn("h-1.5 w-1.5 rounded-full", STATUS_STYLES[p.status].dot)} />
                      <Text className="text-xs text-ink-500">{STATUS_STYLES[p.status].label}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Pressable className="flex-row items-center justify-center gap-2 py-3 active:opacity-70">
            <Ionicons name="download-outline" size={18} color="#0a54d9" />
            <Text className="text-sm font-semibold text-brand-600">Download statement</Text>
          </Pressable>
        </ScrollView>
      )}
    </Screen>
  );
}
