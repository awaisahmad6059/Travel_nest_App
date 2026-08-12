import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";

import { availabilityApi } from "@/api/availabilityApi";
import { paymentApi } from "@/api/paymentApi";
import { ApiError } from "@/api/client";
import { useCreateBooking } from "@/features/booking/useBookings";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ListingImage } from "@/components/ListingImage";
import { useBookingDraft } from "@/store/bookingDraftStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { cn } from "@/utils/cn";
import { formatCurrency, formatDate } from "@/utils/format";
import { mapPrice } from "@/api/contracts";

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PaymentScreen() {
  const router = useRouter();
  const { draft, clearDraft } = useBookingDraft();
  const { travelers, contactEmail, contactPhone, specialRequirements, hold, setHold, clearHold, reset } =
    useCheckoutStore();
  const createBooking = useCreateBooking();

  const [methods, setMethods] = useState<{ id: string; label: string; detail: string }[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Promo code (demo UI — API wiring comes later).
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoApplied, setPromoApplied] = useState<string | null>(null);

  // Inventory hold state (API_HANDOFF.md §4.2 / §4.4).
  const [holding, setHolding] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const subtotal = draft ? draft.unitPrice * draft.quantity : 0;
  const currency = draft?.currency ?? "USD";
  const needsHold = !!draft?.slotId;
  const earliestExpiry = hold?.expiresAt ?? null;
  const holdsComplete = !needsHold || !!hold;
  const holdExpired = earliestExpiry != null && earliestExpiry <= now;
  // Re-hold when the hold is missing or expired (covers server-side 409 too).
  const needsRehold = needsHold && (!hold || holdExpired);
  const total = subtotal;

  function applyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoMessage("Enter a promo code.");
      return;
    }
    if (code === "WELCOME20" || code === "SUMMER15" || code === "TRAVELNEST2026") {
      setPromoApplied(code);
      setPromoMessage(null);
    } else {
      setPromoMessage("Invalid promo code.");
    }
  }

  async function placeHolds() {
    if (!draft?.slotId) return;
    setHolding(true);
    setHoldError(null);
    try {
      if (hold && hold.expiresAt > Date.now()) return;
      const h = await availabilityApi.hold({
        slot_id: draft.slotId,
        option_id: draft.optionId,
        quantity: draft.quantity,
      });
      setHold(h);
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

  // Place the hold once the screen opens, then tick a countdown while active.
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

  async function pay() {
    if (!selected || !draft) return;
    if (needsRehold) {
      setError(
        "Your slot reservation is missing or expired. Tap Re-hold to reserve the slot again before paying.",
      );
      return;
    }
    setPaying(true);
    setError(null);
    console.log("[NAVDEBUG] pay() start: draft.slotId =", draft.slotId, "hold =", hold);
    try {
      const result = await paymentApi.charge({
        amount: total,
        currency,
        paymentMethodId: selected,
        couponCode: null,
      });
      console.log("[NAVDEBUG] pay(): charge done, status =", result.status);
      if (result.status === "failure") {
        setError(result.message);
        setPaying(false);
        return;
      }
      const paymentToken = result.transactionId;

      // Single booking backed by its own inventory hold.
      const unitPrice = mapPrice(draft.unitPrice, draft.currency);
      const lineTotal = mapPrice(draft.unitPrice * draft.quantity, draft.currency);
      console.log("[NAVDEBUG] pay(): BEFORE createBooking");
      const booking = await createBooking.mutateAsync({
        items: [
          {
            listingId: draft.listingId,
            listingSlug: draft.listingTitle,
            title: draft.listingTitle,
            thumbnailKey: draft.thumbnail.key,
            thumbnail: draft.thumbnail,
            imageUrl: draft.imageUrl,
            optionName: draft.optionName,
            date: draft.date,
            quantity: draft.quantity,
            unitPrice,
            total: lineTotal,
          },
        ],
        travelers,
        total: lineTotal,
        holdId: draft.slotId ? hold?.holdId : undefined,
        paymentToken,
        specialRequirements: specialRequirements.trim(),
      });
      console.log("[NAVDEBUG] pay(): AFTER createBooking, booking.id =", booking?.id, "bookingRef =", booking?.bookingRef);

      const bookingId = booking.id;
      const target = `/checkout/confirmation?bookingIds=${bookingId}`;
      console.log("[NAVDEBUG] pay(): navigating to ->", target);
      // Pop the checkout screens (listing/travelers/payment) so Back from
      // confirmation or the voucher goes to Home, not back to Pay Now.
      router.dismissAll();
      router.push({ pathname: "/checkout/confirmation", params: { bookingIds: bookingId } });
      console.log("[NAVDEBUG] pay(): router.push() CALLED (enqueued)");

      // Clean up checkout state only after navigation has been initiated so
      // the confirmation route is not unmounted by a missing draft.
      clearDraft();
      reset();
    } catch (e) {
      // The backend rejects booking with an expired/invalid hold (409). Treat
      // it as "re-select/reserve" — clear the stale hold and show a clean
      // action instead of the raw error.
      if (e instanceof ApiError && e.status === 409) {
        clearHold();
        setError(
          "Your slot reservation expired. Tap Re-hold to reserve the slot again, then try payment again.",
        );
      } else {
        setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
      }
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
        {/* Booking summary — same listing image/data the user selected */}
        {draft ? (
          <View className="flex-row items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3">
            <ListingImage
              thumbnail={draft.thumbnail}
              url={draft.imageUrl}
              className="h-16 w-16 rounded-xl"
            />
            <View className="flex-1">
              <Text className="text-sm font-bold text-ink-900" numberOfLines={2}>
                {draft.listingTitle}
              </Text>
              <Text className="mt-0.5 text-xs text-ink-500">
                {draft.optionName} · {formatDate(draft.date)}
                {draft.quantity > 1 ? ` · ${draft.quantity} pax` : ""}
              </Text>
              <Text className="mt-1 text-sm font-bold text-ink-900">
                {formatCurrency(draft.unitPrice * draft.quantity, draft.currency)}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Inventory hold status */}
        {needsHold ? (
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
                    {hold ? "Inventory hold expired" : "No active slot reservation"}
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
          {promoApplied ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-success-600">
                Promo Discount ({promoApplied})
              </Text>
              <Text className="text-sm text-success-600">
                -${(subtotal * 0.15).toFixed(2)}
              </Text>
            </View>
          ) : null}
          <View className="h-px bg-ink-100 my-1" />
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-bold text-ink-900">Total</Text>
            <Text className="text-xl font-extrabold text-ink-900">${total.toFixed(2)}</Text>
          </View>

          <View className="mt-3">
            <Text className="text-xs font-semibold text-ink-700 mb-1.5">
              Promo / Coupon Code
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Try: WELCOME20, SUMMER15"
                placeholderTextColor="#848d9c"
                autoCapitalize="characters"
                className="flex-1 bg-surface-100 border border-ink-200 rounded-xl px-3 py-2 text-sm text-ink-900"
              />
              <Pressable
                onPress={applyPromo}
                className="rounded-xl bg-brand-600 px-4 items-center justify-center"
              >
                <Text className="text-sm font-semibold text-white">Apply</Text>
              </Pressable>
            </View>
            {promoMessage ? (
              <Text className="mt-1.5 text-xs text-danger-600">{promoMessage}</Text>
            ) : null}
            {promoApplied ? (
              <Text className="mt-1.5 text-xs text-success-600">
                Promo code applied — 15% discount.
              </Text>
            ) : null}
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
