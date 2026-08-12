import { Text, View } from "react-native";
import { cn } from "@/utils/cn";

/**
 * Mock QR code. Renders a deterministic pseudo-random grid based on the token
 * so it looks like a scannable QR. Replaced by a real QR library/voucher
 * service in a later phase.
 */
export function QRCodePlaceholder({
  token,
  size = 180,
  label,
  labelClassName,
}: {
  token: string;
  size?: number;
  /** Text shown under the grid. Defaults to the raw token. */
  label?: string;
  labelClassName?: string;
}) {
  const cells = 13;
  const seed = token
    .split("")
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 997, 7);
  const rand = (i: number) => (seed * (i + 5) + i * 17) % 10 < 5;

  return (
    <View
      style={{ width: size, height: size, padding: size * 0.08 }}
      className="bg-white rounded-2xl border border-ink-200"
    >
      <View style={{ flex: 1 }} className="flex-row flex-wrap">
        {Array.from({ length: cells * cells }).map((_, i) => {
          const row = Math.floor(i / cells);
          const col = i % cells;
          const isFinder = (row < 3 && col < 3) || (row < 3 && col >= cells - 3) || (row >= cells - 3 && col < 3);
          const filled = isFinder ? rand(row * cells + col) : rand(i);
          return (
            <View
              key={i}
              style={{
                width: `${100 / cells}%`,
                height: `${100 / cells}%`,
                backgroundColor: filled ? "#14181f" : "#ffffff",
              }}
            />
          );
        })}
      </View>
      <Text className={cn("text-center text-xs text-ink-500 mt-2", labelClassName)}>
        {label ?? token}
      </Text>
    </View>
  );
}
