import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";

import { availabilityApi } from "@/api/availabilityApi";
import { paymentApi } from "@/api/paymentApi";
import { useCreateBooking } from "@/features/booking/useBookings";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/store/cartStore";
import { lineKey, useCheckoutStore } from "@/store/checkoutStore";
import { cn } from "@/utils/cn";
import { mapPrice } from "@/api/contracts";
import type { Booking } from "@/types";

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PaymentScreen() {
  const router = useRouter();
  const { lines, coupon, clear, subtotal } = useCart();
  const { travelers, contactEmail, contactPhone, holds, setHold, reset } =
    useCheckoutStore();
  const createBooking = useCreateBooking();

  const [methods, setMethods] = useState<{ id: string; label: string; detail: string }[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inventory hold state (API_HANDOFF.md §4.2 / §4.4).
  const [holding, setHolding] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const needsHold = lines.filter((l) => l.slotId);
  const earliestExpiry = (() => {
    const times = needsHold
      .map((l) => holds[lineKey(l.listingId, l.optionId)]?.expiresAt)
      .filter((t): t is number => typeof t === "number");
    return times.length ? Math.min(...times) : null;
  })();
  const holdsComplete = needsHold.every(
    (l) => holds[lineKey(l.listingId, l.optionId)] != null,
  );
  const holdExpired = earliestExpiry != null && earliestExpiry <= now;

  async function placeHolds() {
    if (needsHold.length === 0) return;
    setHolding(true);
    setHoldError(null);
    try {
      for (const line of needsHold) {
        const key = lineKey(line.listingId, line.optionId);
        const existing = holds[key];
        if (existing && existing.expiresAt > Date.now()) continue;
        const hold = await availabilityApi.hold({
          slot_id: line.slotId as string,
          option_id: line.optionId,
          quantity: line.quantity,
        });
        setHold(key, hold);
      }
    } catch (e) {
      setHoldError(
        e instanceof Error
          ? e.message
          : "Couldn't reserve this experience. Please try again.",
      );
    } finally {
      setHolding(false);
    }
  }

  // Place holds once the screen opens, then tick a countdown while active.
  useEffect(() => {
    const t = setTimeout(() => {
      void placeHolds();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!earliestExpiry) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [earliestExpiry]);

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
    if (needsHold.length > 0 && (holdExpired || !holdsComplete)) {
      setError(
        "Your inventory hold has expired. Tap re-hold to reserve the slot again before paying.",
      );
      return;
    }
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
      const paymentToken = result.transactionId;

      // One booking per cart line, each backed by its own inventory hold.
      const created: Booking[] = [];
      for (const line of lines) {
        const hold = line.slotId ? holds[lineKey(line.listingId, line.optionId)] : undefined;
        const unitPrice = mapPrice(line.unitPrice, line.currency);
        const lineTotal = mapPrice(line.unitPrice * line.quantity, line.currency);
        const booking = await createBooking.mutateAsync({
          items: [
            {
              listingId: line.listingId,
              listingSlug: line.listingTitle,
              title: line.listingTitle,
              thumbnailKey: line.thumbnailKey,
              optionName: line.optionName,
              date: line.date,
              quantity: line.quantity,
              unitPrice,
              total: lineTotal,
            },
          ],
          travelers,
          total: lineTotal,
          holdId: hold?.holdId,
          paymentToken,
        });
        created.push(booking);
      }

      clear();
      reset();
      router.replace(
        `/checkout/confirmation?bookingIds=${created.map((b) => b.id).join(",")}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
      setPaying(false);
    }
  }

  const needsRehold = needsHold.length > 0 && holdExpired;

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
        {/* Inventory hold status */}
        {needsHold.length > 0 ? (
          <View
            className={cn(
              "rounded-2xl border px-4 py-3",
              holdError
                ? "border-danger-200 bg-danger-50"
                : needsRehold
                  ? "border-amber-200 bg-amber-50"
                  : holdsComplete
                    ? "border-success-200 bg-success-50"
                    : "border-ink-200 bg-white",
            )}
          >
            {holding ? (
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-ink-600">Reserving your slot…</Text>
              </View>
            ) : holdError ? (
              <View className="gap-2">
                <Text className="text-sm font-semibold text-danger-600">
                  {"Couldn't reserve your slot"}
                </Text>
                <Text className="text-xs text-danger-600">{holdError}</Text>
                <Button
                  title="Try again"
                  variant="secondary"
                  size="sm"
                  loading={holding}
                  onPress={() => void placeHolds()}
                />
              </View>
            ) : needsRehold ? (
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-amber-900">
                    Inventory hold expired
                  </Text>
                  <Text className="text-xs text-amber-800">
                    Re-hold the slot to continue booking.
                  </Text>
                </View>
                <Button
                  title="Re-hold"
                  variant="secondary"
                  size="sm"
                  loading={holding}
                  onPress={() => void placeHolds()}
                />
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-semibold text-success-600">
                  Inventory held ✓
                </Text>
                <Text className="text-sm text-ink-500">
                  expires in {formatCountdown((earliestExpiry ?? now) - now)}
                </Text>
              </View>
            )}
          </View>
        ) : null}

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
          loading={paying || holding}
          disabled={!selected || needsRehold}
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
