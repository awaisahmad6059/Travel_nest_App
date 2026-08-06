import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { paymentApi } from "@/api/paymentApi";
import { useCreateBooking } from "@/features/booking/useBookings";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { cn } from "@/utils/cn";

export default function PaymentScreen() {
  const router = useRouter();
  const { lines, coupon, clear, subtotal } = useCart();
  const { travelers, contactEmail, contactPhone } = useCheckoutStore();
  const createBooking = useCreateBooking();

  const [methods, setMethods] = useState<{ id: string; label: string; detail: string }[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void paymentApi.getPaymentMethods().then((m) => {
      if (!active) return;
      setMethods(m);
      setSelected(m[0]?.id ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  const discount = coupon
    ? coupon.percentOff
      ? (subtotal * coupon.percentOff) / 100
      : Math.min(coupon.amountOff ?? 0, subtotal)
    : 0;
  const total = Math.max(0, subtotal - discount);

  async function pay() {
    if (!selected) return;
    setPaying(true);
    setError(null);
    try {
      const result = await paymentApi.charge({
        amount: total,
        currency: lines[0]?.currency ?? "USD",
        paymentMethodId: selected,
        couponCode: coupon?.code ?? null,
      });
      if (result.status === "failure") {
        setError(result.message);
        setPaying(false);
        return;
      }

      const booking = await createBooking.mutateAsync({
        items: lines.map((l) => ({
          listingId: l.listingId,
          listingSlug: l.listingTitle,
          title: l.listingTitle,
          thumbnailKey: l.thumbnailKey,
          optionName: l.optionName,
          date: l.date,
          quantity: l.quantity,
          unitPrice: { amount: l.unitPrice, currency: "USD", display: `$${l.unitPrice.toFixed(2)}` },
          total: { amount: l.unitPrice * l.quantity, currency: "USD", display: `$${(l.unitPrice * l.quantity).toFixed(2)}` },
        })),
        travelers,
        total: { amount: total, currency: "USD", display: `$${total.toFixed(2)}` },
      });

      clear();
      router.replace(`/checkout/confirmation?bookingId=${booking.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
      setPaying(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#14181f" />
        </Pressable>
        <Text className="flex-1 text-center text-base font-bold text-ink-900">Payment</Text>
        <View className="w-6" />
      </View>

      <View className="px-5 gap-5 pb-8">
        <View>
          <Text className="text-sm font-semibold text-ink-900 mb-3">Pay with</Text>
          {methods === null ? (
            <View className="gap-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </View>
          ) : (
            <View className="gap-2">
              {methods.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => setSelected(m.id)}
                  className={cn(
                    "flex-row items-center gap-3 rounded-2xl border px-4 py-4",
                    selected === m.id ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white",
                  )}
                >
                  <Ionicons name="card-outline" size={24} color="#0a54d9" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink-900">{m.label}</Text>
                    <Text className="text-xs text-ink-400">{m.detail}</Text>
                  </View>
                  <View
                    className={cn(
                      "h-5 w-5 rounded-full border-2 items-center justify-center",
                      selected === m.id ? "border-brand-600" : "border-ink-300",
                    )}
                  >
                    {selected === m.id ? <View className="h-2.5 w-2.5 rounded-full bg-brand-600" /> : null}
                  </View>
                </Pressable>
              ))}
              <Text className="text-[11px] text-ink-400 mt-1">
                Payment gateway is stubbed for the demo — no real charge is made.
              </Text>
            </View>
          )}
        </View>

        <View className="bg-white rounded-2xl border border-ink-100 p-4 gap-2">
          <Text className="text-sm font-bold text-ink-900 mb-1">Order summary</Text>
          <View className="flex-row justify-between">
            <Text className="text-sm text-ink-500">Subtotal</Text>
            <Text className="text-sm text-ink-700">${subtotal.toFixed(2)}</Text>
          </View>
          {discount > 0 ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-ink-500">Discount ({coupon?.code})</Text>
              <Text className="text-sm text-success-600 font-semibold">-${discount.toFixed(2)}</Text>
            </View>
          ) : null}
          <View className="h-px bg-ink-100 my-1" />
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-bold text-ink-900">Total</Text>
            <Text className="text-xl font-extrabold text-ink-900">${total.toFixed(2)}</Text>
          </View>
        </View>

        {error ? (
          <View className="bg-danger-50 rounded-xl px-4 py-3">
            <Text className="text-sm text-danger-600">{error}</Text>
          </View>
        ) : null}

        <Button
          title={`Pay $${total.toFixed(2)}`}
          size="lg"
          block
          loading={paying}
          disabled={!selected}
          onPress={pay}
        />

        <Text className="text-center text-[11px] text-ink-400">
          By paying you agree to the booking & cancellation terms. Contact for this
          booking: {contactEmail || "—"} {contactPhone ? `· ${contactPhone}` : ""}
        </Text>
      </View>
    </SafeAreaView>
  );
}
