import { Text, View } from "react-native";

/**
 * AI Review Intelligence summary (pros/cons + sentiment) shown on listing
 * detail. Data comes from the backend AI Review Intelligence module.
 */
export function ReviewSummaryPanel({
  pros,
  cons,
  sentimentScore,
}: {
  pros: string[];
  cons: string[];
  sentimentScore?: number;
}) {
  if (pros.length === 0 && cons.length === 0) return null;
  const sentimentPct = sentimentScore != null ? Math.round(100 * sentimentScore) : null;
  return (
    <View className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
      <View className="flex-row items-center gap-2 mb-3">
        <Text className="text-lg">✨</Text>
        <Text className="flex-1 text-base font-bold text-ink-900">
          AI Review Intelligence Summary
        </Text>
        {sentimentPct != null ? (
          <View className="bg-emerald-100 px-2.5 py-1 rounded-full">
            <Text className="text-xs font-bold text-emerald-700">
              {sentimentPct}% Positive Sentiment
            </Text>
          </View>
        ) : null}
      </View>
      <View className="gap-4">
        {pros.length > 0 ? (
          <View>
            <Text className="text-sm font-bold text-emerald-700 mb-1.5">
              Top Pros:
            </Text>
            <View className="gap-1">
              {pros.map((p, i) => (
                <Text key={i} className="text-sm text-ink-700 leading-5">
                  ✓ {p}
                </Text>
              ))}
            </View>
          </View>
        ) : null}
        {cons.length > 0 ? (
          <View>
            <Text className="text-sm font-bold text-amber-700 mb-1.5">
              Traveler Tips:
            </Text>
            <View className="gap-1">
              {cons.map((c, i) => (
                <Text key={i} className="text-sm text-ink-600 leading-5">
                  • {c}
                </Text>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
