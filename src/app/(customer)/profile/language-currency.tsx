import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

import { SubScreenHeader } from "@/components/profile/SubScreenHeader";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import {
  CURRENCIES,
  LANGUAGES,
  useSettingsStore,
  type CurrencyCode,
  type LanguageCode,
} from "@/store/settingsStore";

function RadioRow({
  label,
  detail,
  selected,
  onPress,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-4 border-b border-ink-100"
    >
      <View className="flex-1">
        <Text className="text-sm font-semibold text-ink-900">{label}</Text>
        {detail ? <Text className="text-xs text-ink-400">{detail}</Text> : null}
      </View>
      <Ionicons
        name={selected ? "checkmark-circle" : "ellipse-outline"}
        size={22}
        color={selected ? "#0a54d9" : "#c3c9d4"}
      />
    </Pressable>
  );
}

export default function LanguageCurrencyScreen() {
  const { language, currency, setLanguage, setCurrency } = useSettingsStore();

  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency;

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <SubScreenHeader title="Language & currency" />

      <ScrollView className="flex-1 px-5 pb-8" showsVerticalScrollIndicator={false}>
        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-sm font-bold text-ink-800">Language</Text>
            <View className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
              {LANGUAGES.map((l) => (
                <RadioRow
                  key={l.code}
                  label={l.label}
                  selected={language === l.code}
                  onPress={() => setLanguage(l.code as LanguageCode)}
                />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-ink-800">Currency</Text>
            <View className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
              {CURRENCIES.map((c) => (
                <RadioRow
                  key={c.code}
                  label={`${c.code} — ${c.label}`}
                  detail={`Symbol: ${c.symbol}`}
                  selected={currency === c.code}
                  onPress={() => setCurrency(c.code as CurrencyCode)}
                />
              ))}
            </View>
          </View>

          <View className="bg-brand-50 rounded-2xl border border-brand-100 px-4 py-4">
            <Text className="text-xs font-semibold text-brand-700 uppercase tracking-wide">
              Preview
            </Text>
            <Text className="mt-1 text-xl font-extrabold text-ink-900">
              {symbol}425.00
            </Text>
            <Text className="mt-1 text-xs text-ink-500">
              Prices across the app currently keep their source currency — this preview shows
              how the selected currency will be presented.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
