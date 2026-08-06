import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { paymentApi } from "@/api/paymentApi";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { TONE_BARS } from "@/mocks/placeholders";
import { useCart } from "@/store/cartStore";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function CartScreen() {
  const router = useRouter();
  const {
    lines,
    coupon,
    updateQuantity,
    removeLine,
    applyCoupon,
    subtotal,
    count,
  } = useCart();

  const [code, setCode] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  async function handleCoupon() {
    if (!code.trim()) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const result = await paymentApi.applyCoupon(code);
      if (!result) {
        throw new Error("Invalid coupon code.");
      }
      applyCoupon(result);
      setCode("");
      Alert.alert("Coupon applied", result.description);
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : "Invalid coupon.");
    } finally {
      setCouponBusy(false);
    }
  }

  const discount = coupon
    ? coupon.percentOff
      ? (subtotal * coupon.percentOff) / 100
      : Math.min(coupon.amountOff ?? 0, subtotal)
    : 0;
  const total = Math.max(0, subtotal - discount);

  if (lines.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-100">
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#14181f" />
          </Pressable>
          <Text className="flex-1 text-center text-base font-bold text-ink-900">Cart</Text>
          <View className="w-6" />
        </View>
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          message="Browse experiences and add one to get started."
        />
        <View className="px-5 pb-8">
          <Button title="Browse experiences" size="lg" block onPress={() => router.replace("/search")} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#14181f" />
        </Pressable>
        <Text className="flex-1 text-center text-base font-bold text-ink-900">
          Cart · {count}
        </Text>
        <View className="w-6" />
      </View>

      <View className="px-5 gap-4 pb-8">
        {lines.map((line) => (
          <View key={`${line.listingId}-${line.optionId}`} className="bg-white rounded-2xl border border-ink-100 p-4">
            <View className="flex-row gap-3">
              <View
                className={`h-16 w-16 rounded-xl items-center justify-center ${TONE_BARS[line.thumbnailKey as keyof typeof TONE_BARS] ?? "bg-ink-200"}`}
              >
                <Text className="text-2xl">{line.listingTitle.slice(0, 1)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-ink-900" numberOfLines={2}>
                  {line.listingTitle}
                </Text>
                <Text className="mt-0.5 text-xs text-ink-500">
                  {line.optionName} · {formatDate(line.date)}
                </Text>
                <View className="mt-1.5 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={() => updateQuantity(line.listingId, line.optionId, line.quantity - 1)}
                      className="h-7 w-7 rounded-full border border-ink-200 items-center justify-center"
                    >
                      <Text className="text-base text-ink-700">−</Text>
                    </Pressable>
                    <Text className="text-sm font-bold text-ink-900">{line.quantity}</Text>
                    <Pressable
                      onPress={() => updateQuantity(line.listingId, line.optionId, line.quantity + 1)}
                      className="h-7 w-7 rounded-full border border-ink-200 items-center justify-center"
                    >
                      <Text className="text-base text-ink-700">+</Text>
                    </Pressable>
                  </View>
                  <Text className="text-sm font-bold text-ink-900">
                    ${(line.unitPrice * line.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={() => removeLine(line.listingId, line.optionId)}
              className="mt-3 self-end"
            >
              <Text className="text-xs font-medium text-danger-600">Remove</Text>
            </Pressable>
          </View>
        ))}

        {/* Coupon */}
        <View className="bg-white rounded-2xl border border-ink-100 p-4">
          <Text className="text-sm font-semibold text-ink-900 mb-2">Coupon code</Text>
          {coupon ? (
            <View className="flex-row items-center justify-between bg-success-50 rounded-xl px-4 py-3">
              <View>
                <Text className="text-sm font-bold text-success-600">{coupon.code}</Text>
                <Text className="text-xs text-success-600">{coupon.description}</Text>
              </View>
              <Pressable onPress={() => applyCoupon(null)}>
                <Text className="text-xs font-medium text-danger-600">Remove</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 bg-white border border-ink-200 rounded-xl px-4 py-3 text-base text-ink-900"
                placeholder="Try WELCOME10 or SUMMER25"
                placeholderTextColor="#848d9c"
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
              />
              <Button
                title="Apply"
                variant="secondary"
                loading={couponBusy}
                onPress={handleCoupon}
              />
            </View>
          )}
          {couponError ? (
            <Text className="mt-2 text-xs text-danger-600">{couponError}</Text>
          ) : null}
        </View>

        {/* Summary */}
        <View className="bg-white rounded-2xl border border-ink-100 p-4 gap-2">
          <Text className="text-sm font-bold text-ink-900 mb-1">Price summary</Text>
          <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
          {discount > 0 ? (
            <SummaryRow label={`Discount (${coupon?.code})`} value={`-$${discount.toFixed(2)}`} accent />
          ) : null}
          <View className="h-px bg-ink-100 my-1" />
          <SummaryRow label="Total" value={`$${total.toFixed(2)}`} strong />
        </View>

        <Button title="Checkout" size="lg" block onPress={() => router.push("/checkout/travelers")} />
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className={cn("text-sm", strong ? "font-bold text-ink-900" : "text-ink-500")}>{label}</Text>
      <Text
        className={cn(
          strong ? "text-base font-extrabold text-ink-900" : "text-sm",
          accent ? "text-success-600 font-semibold" : "",
        )}
      >
        {value}
      </Text>
    </View>
  );
}
