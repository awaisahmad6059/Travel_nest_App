import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
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
import {
  useContextualQA,
  useCreateReview,
  useListing,
  useMarkReviewHelpful,
  useRelatedListings,
} from "@/features/listing/useListing";
import { useListingReviews } from "@/features/supplier/useSupplier";
import { useSlots } from "@/features/booking/useBookings";
import { useBookingDraft } from "@/store/bookingDraftStore";
import { useWishlist } from "@/store/wishlistStore";
import { formatDate, formatLongDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Listing, Review } from "@/types";
import type { Slot } from "@/api/contracts";

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
  const [reviewOpen, setReviewOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const contextualQA = useContextualQA();
  const createReview = useCreateReview();
  const markHelpful = useMarkReviewHelpful();

  async function handleAskAI() {
    if (!aiQuestion.trim()) return;
    const res = await contextualQA.mutateAsync({
      listingId: id,
      question: aiQuestion.trim(),
    });
    setAiAnswer(res.answer);
  }

  function handleReviewSubmitted(review: Review) {
    setReviewOpen(false);
    Alert.alert(
      "Review submitted",
      `Thank you, ${review.authorName}! Your review has been published.`,
    );
  }

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

        {/* Know Before You Go */}
        {(listing.knowBeforeYouGo ?? []).length > 0 ? (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-ink-900 mb-3">
              Know Before You Go
            </Text>
            <View className="bg-slate-50 border border-ink-100 rounded-2xl p-4 gap-2.5">
              {(listing.knowBeforeYouGo ?? []).map((item, i) => (
                <View key={i} className="flex-row gap-2.5 items-start">
                  <Ionicons name="alert-circle-outline" size={18} color="#0a54d9" />
                  <Text className="flex-1 text-sm text-ink-700 leading-5">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Ask AI About This Experience */}
        <View className="px-5 mt-6">
          <View className="bg-white border border-ink-200 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="help-circle-outline" size={20} color="#0a54d9" />
              <Text className="text-base font-bold text-ink-900">
                Ask AI About This Experience
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TextInput
                value={aiQuestion}
                onChangeText={setAiQuestion}
                placeholder="Ask anything (e.g. &apos;Is this suitable for kids?&apos;)"
                placeholderTextColor="#848d9c"
                className="flex-1 bg-surface-100 border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-900"
                onSubmitEditing={() => void handleAskAI()}
                returnKeyType="send"
              />
              <Button
                title={contextualQA.isPending ? "Asking..." : "Ask AI"}
                size="md"
                loading={contextualQA.isPending}
                disabled={!aiQuestion.trim()}
                onPress={() => void handleAskAI()}
              />
            </View>
            {contextualQA.isError ? (
              <Text className="mt-3 text-sm text-danger-600">
                Sorry, I couldn&apos;t answer that right now. Please try again.
              </Text>
            ) : null}
            {aiAnswer ? (
              <View className="mt-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
                <Text className="text-sm text-sky-900 leading-5">
                  <Text className="font-bold">🤖 AI Concierge Answer: </Text>
                  {aiAnswer}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
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
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-ink-900">
              ⭐ Traveler Reviews{" "}
              <Text className="text-sm font-normal text-ink-400">
                ({listing.reviewCount})
              </Text>
            </Text>
            <Button
              title="Write a Review"
              size="sm"
              variant="primary"
              onPress={() => setReviewOpen(true)}
            />
          </View>
          <ReviewSummaryPanel
            pros={listing.reviewSummary?.pros ?? []}
            cons={listing.reviewSummary?.cons ?? []}
            sentimentScore={listing.reviewSummary?.sentimentScore}
          />
          <View className="mt-4 gap-4">
            {(reviews ?? []).map((r) => (
              <View key={r.id} className="bg-white rounded-2xl border border-ink-100 p-4">
                <View className="flex-row items-center gap-2">
                  {r.avatarUrl ? (
                    <Image source={{ uri: r.avatarUrl }} className="h-8 w-8 rounded-full" />
                  ) : (
                    <View className="h-8 w-8 rounded-full bg-brand-50 items-center justify-center">
                      <Text className="text-base">{r.authorEmoji || "🧳"}</Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink-900">{r.authorName}</Text>
                    <RatingStars rating={r.rating} size={12} />
                  </View>
                  <Text className="text-xs text-ink-400">{formatDate(r.date)}</Text>
                </View>
                {r.title ? (
                  <Text className="mt-2 text-sm font-semibold text-ink-900">{r.title}</Text>
                ) : null}
                <Text className="mt-1 text-sm text-ink-600 leading-5">{r.comment}</Text>
                {r.photos && r.photos.length > 0 ? (
                  <View className="mt-2 flex-row gap-2">
                    {r.photos.slice(0, 4).map((p, i) => (
                      <Image key={i} source={{ uri: p }} className="h-16 w-20 rounded-lg" />
                    ))}
                  </View>
                ) : null}
                {r.supplierReply ? (
                  <View className="mt-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
                    <Text className="text-xs font-bold text-sky-700 mb-1">
                      🛡️ Supplier Response
                    </Text>
                    <Text className="text-sm text-slate-700 leading-5">{r.supplierReply}</Text>
                  </View>
                ) : null}
                <Pressable
                  onPress={() => markHelpful.mutate(r.id)}
                  className="mt-3 self-start flex-row items-center gap-1.5 rounded-full border border-ink-200 bg-surface-100 px-3 py-1.5"
                >
                  <Ionicons name="thumbs-up-outline" size={13} color="#64748b" />
                  <Text className="text-xs text-ink-500">
                    Helpful ({r.helpfulCount ?? 0})
                  </Text>
                </Pressable>
              </View>
            ))}
            {(reviews ?? []).length === 0 ? (
              <Text className="text-center text-sm text-ink-400 py-6">
                No reviews yet. Be the first to share your experience!
              </Text>
            ) : null}
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
        <Button title="Book slots" size="lg" onPress={() => setSheetOpen(true)} />
      </View>

      <BookingSheet
        listing={listing}
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <WriteReviewSheet
        listing={listing}
        visible={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmit={createReview}
        onSubmitted={handleReviewSubmitted}
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
  const { setDraft } = useBookingDraft();
  const { data: slotsData, isLoading: slotsLoading } = useSlots(listing.id);

  // Backend slots, sorted by date.
  const backendSlots = (slotsData ?? []).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  // Generate fallback slots for the next 7 days (same as web) when the backend
  // returns 0 or very few real slots. These use "hold_demo_*" ids which are
  // handled by the local demo-booking path in bookingApi.createBooking.
  const fallbackSlots: Slot[] = (() => {
    if (backendSlots.length >= 3) return backendSlots;
    const generated: Slot[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() + 86400000 * (i + 1));
      date.setHours(10, 0, 0, 0);
      generated.push({
        id: `slot-${i}`,
        listingId: listing.id,
        startTime: date.toISOString(),
        endTime: new Date(date.getTime() + (listing.duration ? parseInt(listing.duration) * 3600000 : 14400000)).toISOString(),
        totalCapacity: 10,
        bookedCapacity: 0,
        heldCapacity: 0,
        remaining: 10,
      });
    }
    return [...backendSlots, ...generated];
  })();

  const slots = fallbackSlots;

  const [slotId, setSlotId] = useState<string | undefined>(undefined);
  const [optionId, setOptionId] = useState(listing.options[0]?.id ?? "");
  const [qty, setQty] = useState(1);

  const selectedSlot = slotId ? slots.find((s) => s.id === slotId) : undefined;
  const option = listing.options.find((o) => o.id === optionId) ?? listing.options[0];
  const canBook = !!option && !!selectedSlot;
  const maxQty = selectedSlot ? Math.min(selectedSlot.remaining, 10) : 10;
  const total = (option?.price.amount ?? listing.price.amount) * qty;

  function bookNow() {
    if (!option || !canBook) return;
    // Fallback slots use demo hold ids — the checkout flow handles these locally.
    const isDemoSlot = selectedSlot.id.startsWith("slot-");
    setDraft({
      listingId: listing.id,
      listingTitle: listing.title,
      thumbnail: listing.thumbnail,
      imageUrl: listing.images[0]?.url,
      optionId: option.id,
      optionName: option.name,
      unitPrice: option.price.amount,
      currency: option.price.currency,
      quantity: qty,
      date: selectedSlot?.startTime ?? "",
      slotId: isDemoSlot ? `hold_demo_${selectedSlot.id}` : selectedSlot?.id,
      freeCancellation: listing.freeCancellation,
      instantConfirmation: listing.instantConfirmation,
      supplierId: listing.supplierId,
    });
    onClose();
    router.push("/checkout/travelers");
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
          <Button
            title="Book Now"
            size="lg"
            block
            disabled={!canBook}
            onPress={bookNow}
          />
        </View>
      }
    >
      <Text className="text-sm font-semibold text-ink-900 mb-2">
        Select Ticket Option / Variant
      </Text>
      <View className="gap-2 mb-5">
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

      <Text className="text-sm font-semibold text-ink-900 mb-2">
        Select Date & Time Slot
      </Text>
      {slotsLoading ? (
        <View className="gap-2 mb-5">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </View>
      ) : slots.length === 0 ? (
        <View className="mb-5 rounded-2xl border border-ink-100 bg-surface-100 px-4 py-6 items-center">
          <Ionicons name="calendar-outline" size={24} color="#848d9c" />
          <Text className="mt-2 text-sm text-ink-500 text-center">
            No available time slots for this experience right now. Please check back later.
          </Text>
        </View>
      ) : (
        <View className="gap-2 mb-5">
          {slots.map((slot) => {
            const selected = slot.id === slotId;
            const soldOut = slot.remaining <= 0;
            return (
              <Pressable
                key={slot.id}
                disabled={soldOut}
                onPress={() => setSlotId(slot.id)}
                className={cn(
                  "rounded-2xl border px-4 py-3",
                  selected
                    ? "border-brand-500 bg-brand-50"
                    : soldOut
                      ? "border-ink-100 bg-ink-50"
                      : "border-ink-200 bg-white",
                )}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <Text className={cn("text-sm font-semibold", selected ? "text-brand-800" : soldOut ? "text-ink-400" : "text-ink-900")}>
                      {formatLongDate(slot.startTime)}
                    </Text>
                    <Text className={cn("text-xs mt-0.5", selected ? "text-brand-600" : "text-ink-400")}>
                      {slotTime(slot.startTime)}
                    </Text>
                  </View>
                  <Text className={cn(
                    "text-xs font-semibold",
                    soldOut ? "text-danger-500" : selected ? "text-brand-700" : slot.remaining <= 3 ? "text-amber-600" : "text-success-600",
                  )}>
                    {soldOut ? "Sold Out" : `${slot.remaining} seats available`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-ink-900">Number of Guests</Text>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            className="h-9 w-9 rounded-full border border-ink-200 items-center justify-center"
          >
            <Text className="text-lg text-ink-700">−</Text>
          </Pressable>
          <Text className="text-base font-bold text-ink-900">{qty}</Text>
          <Pressable
            onPress={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="h-9 w-9 rounded-full border border-ink-200 items-center justify-center"
          >
            <Text className="text-lg text-ink-700">+</Text>
          </Pressable>
        </View>
      </View>
    </Sheet>
  );
}

/** Inline star picker used by the write-review sheet. */
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="flex-row gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Pressable key={s} onPress={() => onChange(s)} hitSlop={6}>
          <Text style={{ fontSize: 30 }} className={s <= value ? "text-amber-400" : "text-ink-200"}>
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function WriteReviewSheet({
  listing,
  visible,
  onClose,
  onSubmit,
  onSubmitted,
}: {
  listing: Listing;
  visible: boolean;
  onClose: () => void;
  onSubmit: {
    mutateAsync: (payload: {
      listing_id: string;
      rating: number;
      title: string;
      comment: string;
      photos?: string[];
    }) => Promise<Review>;
  };
  onSubmitted: (review: Review) => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = comment.trim().length > 0;

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const review = await onSubmit.mutateAsync({
        listing_id: listing.id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
      onSubmitted(review);
    } catch {
      Alert.alert(
        "Could not submit review",
        "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet
      visible={visible}
      title="Share Your Experience"
      onClose={onClose}
      footer={
        <View className="gap-3">
          <Button
            title={submitting ? "Submitting..." : "Submit Review"}
            size="lg"
            block
            loading={submitting}
            disabled={!canSubmit}
            onPress={() => void submit()}
          />
        </View>
      }
    >
      <Text className="text-xs text-ink-500 mb-4">
        Share your experience at <Text className="font-semibold text-ink-800">{listing.title}</Text>
      </Text>

      <Text className="text-sm font-semibold text-ink-900 mb-1.5">Your Rating</Text>
      <View className="mb-4">
        <StarPicker value={rating} onChange={setRating} />
      </View>

      <Text className="text-sm font-semibold text-ink-900 mb-1.5">Review Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. 'Amazing sunset cruise!'"
        placeholderTextColor="#848d9c"
        className="bg-white border border-ink-200 rounded-xl px-4 py-3 text-base text-ink-900 mb-4"
      />

      <Text className="text-sm font-semibold text-ink-900 mb-1.5">Your Review</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Tell travelers about your experience..."
        placeholderTextColor="#848d9c"
        multiline
        numberOfLines={5}
        className="bg-white border border-ink-200 rounded-xl px-4 py-3 text-base text-ink-900"
        textAlignVertical="top"
      />
    </Sheet>
  );
}
