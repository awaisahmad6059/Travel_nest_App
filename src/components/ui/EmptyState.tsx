import { Text, View } from "react-native";

export function EmptyState({
  emoji,
  title,
  message,
}: {
  emoji?: string;
  title: string;
  message?: string;
}) {
  return (
    <View className="items-center justify-center py-16 px-8">
      <Text className="text-5xl mb-3">{emoji ?? "🗺️"}</Text>
      <Text className="text-lg font-bold text-ink-900 text-center">{title}</Text>
      {message ? (
        <Text className="text-sm text-ink-500 text-center mt-1.5 leading-5">
          {message}
        </Text>
      ) : null}
    </View>
  );
}
