import { Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ListingRow } from "@/components/ListingRow";
import { useWishlist } from "@/store/wishlistStore";
import { useWishlistListings } from "@/features/wishlist/useWishlistListings";

export default function WishlistScreen() {
  const { ids } = useWishlist();
  const { data, isLoading } = useWishlistListings(ids);

  const listings = data ?? [];

  if (isLoading) {
    return (
      <Screen className="bg-surface-100">
        <View className="px-5 pt-4 pb-4">
          <Text className="text-2xl font-extrabold text-ink-900">Wishlist</Text>
        </View>
        <View className="px-5 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen className="bg-surface-100">
      <View className="px-5 pt-4 pb-4">
        <Text className="text-2xl font-extrabold text-ink-900">Wishlist</Text>
        <Text className="text-sm text-ink-500 mt-0.5">
          {listings.length} saved {listings.length === 1 ? "experience" : "experiences"}
        </Text>
      </View>

      {listings.length === 0 ? (
        <EmptyState
          emoji="💛"
          title="Your wishlist is empty"
          message="Tap the heart on any experience to save it here for later."
        />
      ) : (
        <View className="px-5 gap-4">
          {listings.map((l) => (
            <ListingRow key={l.id} listing={l} />
          ))}
        </View>
      )}
    </Screen>
  );
}
