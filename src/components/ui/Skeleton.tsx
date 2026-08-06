import { View } from "react-native";

/** Simple shimmer-free skeleton block (solid pulse-less placeholders). */
export function Skeleton({ className }: { className?: string }) {
  return <View className={`bg-ink-100 rounded-xl ${className ?? ""}`} />;
}

export function SkeletonCard() {
  return (
    <View className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <View className="p-3 gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </View>
    </View>
  );
}
