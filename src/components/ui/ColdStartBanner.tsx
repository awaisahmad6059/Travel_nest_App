import { Pressable, Text, View } from "react-native";

/**
 * Explains a slow first request: the backend is typically a sleeping
 * free-tier server that wakes up on the first hit. Dismissible, with an
 * optional retry for the timeout case.
 */
export function ColdStartBanner({
  onDismiss,
  onRetry,
}: {
  onDismiss: () => void;
  onRetry?: () => void;
}) {
  return (
    <View className="mx-5 mt-4 rounded-2xl bg-warning-500/10 border border-warning-500/30 px-4 py-3 flex-row items-start gap-3">
      <Text className="text-xl mt-0.5">☕</Text>
      <View className="flex-1">
        <Text className="text-sm font-bold text-ink-900">Server is waking up</Text>
        <Text className="text-xs text-ink-600 mt-0.5 leading-4">
          The first request can take a few seconds on our free-tier backend.
          Hang tight — it gets fast after that.
        </Text>
        {onRetry ? (
          <Pressable onPress={onRetry} hitSlop={8} className="mt-2 self-start">
            <Text className="text-xs font-bold text-brand-700">Try again</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={onDismiss} hitSlop={8}>
        <Text className="text-base font-bold text-ink-400">✕</Text>
      </Pressable>
    </View>
  );
}
