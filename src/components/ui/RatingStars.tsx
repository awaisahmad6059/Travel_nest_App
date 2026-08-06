import { Text, View } from "react-native";

export function RatingStars({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
  const full = Math.round(rating);
  return (
    <View className="flex-row items-center">
      <Text style={{ fontSize: size }} className="text-amber-400">
        {"★".repeat(Math.max(1, full))}
        <Text className="text-ink-200">{"★".repeat(Math.max(0, 5 - full))}</Text>
      </Text>
      <Text className="ml-1 text-ink-800 font-semibold" style={{ fontSize: size }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}
