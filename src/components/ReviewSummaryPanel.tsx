import { Text, View } from "react-native";

/**
 * AI Review Intelligence summary (pros/cons) shown on listing detail.
 * Data comes from the backend AI Review Intelligence module (mock for now).
 */
export function ReviewSummaryPanel({
  pros,
  cons,
}: {
  pros: string[];
  cons: string[];
}) {
  if (pros.length === 0 && cons.length === 0) return null;
  return (
    <View className="bg-brand-50 rounded-2xl p-4">
      <Text className="text-sm font-bold text-brand-800">
        ✨ What guests loved most
      </Text>
      {pros.length > 0 ? (
        <View className="mt-2 gap-1">
          {pros.map((p, i) => (
            <Text key={i} className="text-sm text-brand-900">
              • {p}
            </Text>
          ))}
        </View>
      ) : null}
      {cons.length > 0 ? (
        <View className="mt-2 gap-1">
          {cons.map((c, i) => (
            <Text key={i} className="text-sm text-ink-600">
              – {c}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
