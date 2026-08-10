import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/ui/RatingStars";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingImage } from "@/components/ListingImage";
import { ReviewSummaryPanel } from "@/components/ReviewSummaryPanel";
import { AppMap } from "@/components/AppMap";
import { useListing, useRelatedListings } from "@/features/listing/useListing";
import { useListingReviews } from "@/features/supplier/useSupplier";
import { useSlots } from "@/features/booking/useBookings";
import { useCart } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { formatDate, formatLongDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Listing } from "@/types";

function nextDays(count = 10) {
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString();
  });
}

/** Formats a slot ISO datetime as "HH:mm". */
function slotTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const wishlist = useWishlist();
  const { data: listing, isLoading } = useListing(id);
  const { data: related } = useRelatedListings(id);
  const { data: reviews } = useListingReviews(id);

  const [sheetOpen, setSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface-100 p-5 gap-4">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView className="flex-1 bg-surface-100">
        <EmptyState emoji="🤷" title="Listing not found" message="It may have been removed." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <ScrollView contentContainerClassName="pb-32">
        {/* Gallery */}
        <View className="relative">
          <ListingImage
            thumbnail={listing.thumbnail}
            url={listing.images[0]?.url}
            className="h-72 w-full"
          />
          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white items-center justify-center shadow"
          >
            <Ionicons name="chevron-back" size={22} color="#14181f" />
          </Pressable>
          <Pressable
            onPress={() => wishlist.toggle(listing.id)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white items-center justify-center shadow"
          >
            <Ionicons
              name={wishlist.isSaved(listing.id) ? "heart" : "heart-outline"}
              size={20}
              color={wishlist.isSaved(listing.id) ? "#ef4444" : "#14181f"}
            />
          </Pressable>
        </View>

        {/* Title block */}
        <View className="px-5 pt-5">
          <View className="flex-row flex-wrap gap-2 mb-2">
            {listing.freeCancellation ? <Badge label="Free cancellation" tone="success" /> : null}
            {listing.instantConfirmation ? <Badge label="Instant confirmation" tone="brand" /> : null}
          </View>
          <Text className="text-2xl font-extrabold text-ink-900 leading-8">
            {listing.title}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <RatingStars rating={listing.rating} size={16} />
            <Text className="text-sm text-ink-500">
              · {listing.reviewCount} reviews
            </Text>
          </View>
          <View className="mt-2 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={15} color="#848d9c" />
            <Text className="text-sm text-ink-600">
              {listing.destination}, {listing.country} · {listing.duration}
            </Text>
          </View>
        </View>

        {/* Highlights */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-ink-900 mb-3">Highlights</Text>
          <View className="gap-2.5">
            {listing.highlights.map((h, i) => (
              <View key={i} className="flex-row gap-2.5">
                <Text className="text-brand-600">✓</Text>
                <Text className="flex-1 text-sm text-ink-700 leading-5">{h}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-ink-900 mb-2">About this experience</Text>
          <Text className="text-sm text-ink-600 leading-6">{listing.description}</Text>
        </View>

        {/* Includes / Excludes */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-ink-900 mb-3">{"What's included"}</Text>
          <View className="gap-2">
            {listing.includes.map((item, i) => (
              <View key={i} className="flex-row gap-2.5">
                <Text className="text-success-600">✓</Text>
                <Text className="flex-1 text-sm text-ink-700">{item}</Text>
              </View>
            ))}
          </View>
          {listing.excludes.length > 0 ? (
            <>
              <Text className="text-sm font-semibold text-ink-900 mt-4 mb-2">Not included</Text>
              <View className="gap-2">
                {listing.excludes.map((item, i) => (
                  <View key={i} className="flex-row gap-2.5">
                    <Text className="text-ink-300">✗</Text>
                    <Text className="flex-1 text-sm text-ink-500">{item}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </View>

        {/* Itinerary */}
        {listing.itinerary.length > 0 ? (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-ink-900 mb-3">Itinerary</Text>
            <View className="gap-0">
              {listing.itinerary.map((step, i) => (
                <View key={i} className="flex-row gap-3">
                  <View className="items-center">
                    <View className="h-8 w-8 rounded-full bg-brand-50 border border-brand-100 items-center justify-center">
                      <Text className="text-xs font-bold text-brand-700">{i + 1}</Text>
                    </View>
                    {i < listing.itinerary.length - 1 ? (
                      <View className="flex-1 w-px bg-ink-200 my-1" />
                    ) : null}
                  </View>
                  <View className="pb-5 flex-1">
                    <Text className="text-sm font-bold text-ink-900">
                      {step.time} · {step.title}
                    </Text>
                    {step.description ? (
                      <Text className="text-sm text-ink-500 mt-1">{step.description}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Meeting point */}
        {listing.meetingPoint ? (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-ink-900 mb-3">Meeting point</Text>
            <AppMap point={listing.meetingPoint} height={180} />
            <Text className="mt-2 text-sm text-ink-500">{listing.meetingPoint.label}</Text>
          </View>
        ) : null}

        {/* Reviews */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-ink-900 mb-3">Reviews</Text>
          <ReviewSummaryPanel
            pros={listing.reviewSummary?.pros ?? []}
            cons={listing.reviewSummary?.cons ?? []}
          />
          <View className="mt-4 gap-4">
            {(reviews ?? []).slice(0, 3).map((r) => (
              <View key={r.id} className="bg-white rounded-2xl border border-ink-100 p-4">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 rounded-full bg-brand-50 items-center justify-center">
                    <Text className="text-base">{r.authorEmoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink-900">{r.authorName}</Text>
                    <RatingStars rating={r.rating} size={12} />
                  </View>
                  <Text className="text-xs text-ink-400">{formatDate(r.date)}</Text>
                </View>
                <Text className="mt-2 text-sm font-semibold text-ink-900">{r.title}</Text>
                <Text className="mt-1 text-sm text-ink-600 leading-5">{r.comment}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Related */}
        {related && related.length > 0 ? (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-ink-900 mb-3">You might also like</Text>
            <View className="gap-4">
              {related.slice(0, 3).map((l) => (
                <Pressable
                  key={l.id}
                  onPress={() => router.replace(`/listing/${l.id}`)}
                  className="flex-row bg-white rounded-2xl border border-ink-100 overflow-hidden"
                >
                  <ListingImage thumbnail={l.thumbnail} url={l.images[0]?.url} className="h-20 w-20" />
                  <View className="flex-1 p-3 justify-center">
                    <Text className="text-sm font-semibold text-ink-900" numberOfLines={2}>
                      {l.title}
                    </Text>
                    <Text className="mt-1 text-sm font-bold text-ink-900">{l.price.display}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky booking bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-ink-100 px-5 pt-3 pb-4 flex-row items-center gap-4">
        <View className="flex-1">
          <Text className="text-lg font-extrabold text-ink-900">{listing.price.display}</Text>
          <Text className="text-xs text-ink-400">per person</Text>
        </View>
        <Button title="Book now" size="lg" onPress={() => setSheetOpen(true)} />
      </View>

      <BookingSheet
        listing={listing}
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

function BookingSheet({
  listing,
  visible,
  onClose,
}: {
  listing: Listing;
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { addLine } = useCart();
  const { data: slotsData } = useSlots(listing.id);
  const slots = slotsData ?? [];
  const hasRealSlots = slots.length > 0;

  const [quickDates, setQuickDates] = useState(nextDays);
  const [date, setDate] = useState(quickDates[0]);
  const [slotId, setSlotId] = useState<string | undefined>(undefined);
  const [optionId, setOptionId] = useState(listing.options[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const dateScrollRef = useRef<ScrollView>(null);

  const selectedSlot = hasRealSlots
    ? slots.find((s) => s.id === slotId) ?? slots[0]
    : undefined;
  // Default to the first real slot when none is picked yet.
  const effectiveSlotId = selectedSlot?.id;
  const effectiveDate =
    hasRealSlots && selectedSlot ? selectedSlot.startTime : date;

  const option = listing.options.find((o) => o.id === optionId) ?? listing.options[0];
  const total = (option?.price.amount ?? listing.price.amount) * qty;

  function handleCalendarSelect(iso: string) {
    if (hasRealSlots) {
      const day = iso.slice(0, 10);
      const slot = slots.find((s) => s.startTime.slice(0, 10) === day);
      if (!slot) {
        Alert.alert(
          "No availability",
          "There are no open slots on this date. Pick a date with availability instead.",
        );
        setShowCalendar(false);
        return;
      }
      setSlotId(slot.id);
      setDate(slot.startTime);
      setShowCalendar(false);
      return;
    }
    setDate(iso);
    setQuickDates((prev) =>
      prev.includes(iso) ? prev : [...prev, iso].slice(-40),
    );
    setShowCalendar(false);
    setTimeout(
      () => dateScrollRef.current?.scrollToEnd({ animated: true }),
      150,
    );
  }

  function addToCart() {
    if (!option) return;
    addLine({
      listingId: listing.id,
      listingTitle: listing.title,
      thumbnailKey: listing.thumbnail.key,
      optionId: option.id,
      optionName: option.name,
      unitPrice: option.price.amount,
      currency: option.price.currency,
      quantity: qty,
      date: effectiveDate,
      slotId: effectiveSlotId,
      freeCancellation: listing.freeCancellation,
      instantConfirmation: listing.instantConfirmation,
    });
    onClose();
    router.push("/checkout");
  }

  return (
    <Sheet
      visible={visible}
      title="Book this experience"
      onClose={onClose}
      footer={
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-ink-600">Total</Text>
            <Text className="text-xl font-extrabold text-ink-900">
              ${total.toFixed(2)}
            </Text>
          </View>
          <Button title="Add to cart" size="lg" block onPress={addToCart} />
        </View>
      }
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-semibold text-ink-900">Select date</Text>
        <Pressable
          onPress={() => setShowCalendar((v) => !v)}
          className="flex-row items-center gap-1"
          hitSlop={8}
        >
          <Ionicons
            name={showCalendar ? "close-circle-outline" : "calendar-outline"}
            size={16}
            color="#0a54d9"
          />
          <Text className="text-xs font-semibold text-brand-600">
            {showCalendar ? "Hide calendar" : "More dates"}
          </Text>
        </Pressable>
      </View>
      <Text className="text-xs text-ink-500 mb-2">
        Selected: {formatLongDate(effectiveDate)}
      </Text>
      <ScrollView
        horizontal
        ref={dateScrollRef}
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row gap-2 pr-4">
          {hasRealSlots
            ? slots.map((slot) => {
                const start = new Date(slot.startTime);
                const day = start.getDate().toString();
                const month = start.toLocaleDateString("en-GB", { month: "short" });
                const time = slotTime(slot.startTime);
                const selected = slot.id === selectedSlot?.id;
                const soldOut = slot.remaining <= 0;
                return (
                  <Pressable
                    key={slot.id}
                    disabled={soldOut}
                    onPress={() => {
                      setSlotId(slot.id);
                      setDate(slot.startTime);
                    }}
                    className={cn(
                      "w-[72px] items-center rounded-2xl border py-2.5",
                      selected
                        ? "border-brand-600 bg-brand-600"
                        : soldOut
                          ? "border-ink-100 bg-ink-50"
                          : "border-ink-200 bg-white",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-xl font-bold",
                        selected ? "text-white" : soldOut ? "text-ink-300" : "text-ink-900",
                      )}
                    >
                      {day}
                    </Text>
                    <Text
                      className={cn(
                        "text-xs",
                        selected ? "text-brand-100" : soldOut ? "text-ink-300" : "text-ink-400",
                      )}
                    >
                      {month}
                    </Text>
                    <Text
                      className={cn(
                        "mt-1 text-[11px] font-semibold",
                        selected ? "text-white" : soldOut ? "text-ink-300" : "text-ink-700",
                      )}
                    >
                      {time}
                    </Text>
                    <Text
                      className={cn(
                        "mt-0.5 text-[10px]",
                        selected
                          ? "text-brand-100"
                          : soldOut
                            ? "text-danger-500"
                            : "text-success-600",
                      )}
                    >
                      {soldOut
                        ? "Sold out"
                        : slot.remaining <= 5
                          ? `Only ${slot.remaining} left`
                          : `${slot.remaining} seats`}
                    </Text>
                  </Pressable>
                );
              })
            : quickDates.map((d) => {
                const day = formatDate(d).split(" ")[0];
                const month = formatDate(d).split(" ")[1];
                const selected = date === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDate(d)}
                    className={cn(
                      "w-16 items-center rounded-2xl border py-3",
                      selected ? "border-brand-600 bg-brand-600" : "border-ink-200 bg-white",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-xl font-bold",
                        selected ? "text-white" : "text-ink-900",
                      )}
                    >
                      {day}
                    </Text>
                    <Text
                      className={cn(
                        "text-xs",
                        selected ? "text-brand-100" : "text-ink-400",
                      )}
                    >
                      {month}
                    </Text>
                    {selected ? (
                      <View className="mt-1">
                        <Text className="text-brand-100 text-xs">✓</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
        </View>
      </ScrollView>

      {showCalendar ? (
        <CalendarPicker
          selected={effectiveDate}
          onSelect={handleCalendarSelect}
        />
      ) : null}

      <Text className="text-sm font-semibold text-ink-900 mb-2">Select option</Text>
      <View className="gap-2 mb-4">
        {listing.options.map((o) => {
          const selected = o.id === optionId;
          return (
            <Pressable
              key={o.id}
              onPress={() => setOptionId(o.id)}
              className={cn(
                "flex-row items-center justify-between rounded-2xl border px-4 py-3.5",
                selected ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white",
              )}
            >
              <View className="flex-1 mr-3">
                <Text className={cn("text-sm font-semibold", selected ? "text-brand-800" : "text-ink-900")}>
                  {o.name}
                </Text>
              </View>
              <Text className="text-sm font-bold text-ink-900">{o.price.display}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-ink-900">Quantity</Text>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            className="h-9 w-9 rounded-full border border-ink-200 items-center justify-center"
          >
            <Text className="text-lg text-ink-700">−</Text>
          </Pressable>
          <Text className="text-base font-bold text-ink-900">{qty}</Text>
          <Pressable
            onPress={() => setQty((q) => Math.min(10, q + 1))}
            className="h-9 w-9 rounded-full border border-ink-200 items-center justify-center"
          >
            <Text className="text-lg text-ink-700">+</Text>
          </Pressable>
        </View>
      </View>
    </Sheet>
  );
}

/** Lightweight month calendar for picking a date beyond the quick-pick row. */
function CalendarPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date(selected);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const selectedMs = (() => {
    const d = new Date(selected);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const canGoPrev =
    cursor.getTime() > new Date(today.getFullYear(), today.getMonth(), 1).getTime();

  return (
    <View className="bg-white rounded-2xl border border-ink-200 p-3 mb-4">
      <View className="flex-row items-center justify-between mb-1">
        <Pressable
          onPress={() => setCursor(new Date(year, month - 1, 1))}
          disabled={!canGoPrev}
          className="h-8 w-8 items-center justify-center"
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={canGoPrev ? "#14181f" : "#c3c9d4"}
          />
        </Pressable>
        <Text className="text-sm font-bold text-ink-900">
          {cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </Text>
        <Pressable
          onPress={() => setCursor(new Date(year, month + 1, 1))}
          className="h-8 w-8 items-center justify-center"
        >
          <Ionicons name="chevron-forward" size={18} color="#14181f" />
        </Pressable>
      </View>

      <View className="flex-row mb-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => (
          <Text key={w} className="flex-1 text-center text-xs text-ink-400">
            {w}
          </Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} className="flex-row">
          {week.map((d, di) => {
            if (!d) return <View key={`e-${wi}-${di}`} className="flex-1 py-1.5" />;
            const ms = d.getTime();
            const disabled = ms < todayMs;
            const isSelected = ms === selectedMs;
            return (
              <Pressable
                key={`d-${wi}-${di}`}
                disabled={disabled}
                onPress={() => onSelect(d.toISOString())}
                className={cn(
                  "flex-1 items-center py-1.5",
                  isSelected && "rounded-full bg-brand-600",
                )}
              >
                <Text
                  className={cn(
                    "text-sm",
                    isSelected
                      ? "text-white font-bold"
                      : disabled
                        ? "text-ink-200"
                        : "text-ink-800",
                  )}
                >
                  {d.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
