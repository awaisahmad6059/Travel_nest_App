import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useSession } from "@/auth/sessionStore";
import { isValidEmail, isValidPhone } from "@/utils/format";

export default function TravelersScreen() {
  const router = useRouter();
  const { count } = useCart();
  const { user } = useSession();
  const {
    travelers,
    contactEmail,
    contactPhone,
    setTravelers,
    setContact,
  } = useCheckoutStore();

  const [names, setNames] = useState<string[]>(
    Array.from({ length: count }).map((_, i) => travelers[i]?.name ?? (i === 0 ? user?.name ?? "" : "")),
  );
  const [email, setEmail] = useState(contactEmail || user?.email || "");
  const [phone, setPhone] = useState(contactPhone || user?.phone || "");
  const [error, setError] = useState<string | null>(null);

  function onContinue() {
    if (names.some((n) => !n.trim())) {
      return setError("Please fill in every traveller's name.");
    }
    if (!isValidEmail(email)) {
      return setError("Please enter a valid contact email.");
    }
    if (phone && !isValidPhone(phone)) {
      return setError("Please enter a valid phone number.");
    }
    setError(null);
    const updated = names.map((n, i) => ({
      id: `tr_${Date.now()}_${i}`,
      name: n.trim(),
    }));
    setTravelers(updated);
    setContact(email, phone);
    router.push("/checkout/payment");
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#14181f" />
        </Pressable>
        <Text className="flex-1 text-center text-base font-bold text-ink-900">
          Traveller details
        </Text>
        <Text className="text-xs text-ink-400">{count} pax</Text>
      </View>

      <View className="px-5 gap-5 pb-8">
        <View className="gap-3">
          <Text className="text-sm font-semibold text-ink-900">
            Traveller{count > 1 ? "s" : ""}
          </Text>
          {names.map((n, i) => (
            <Input
              key={i}
              label={`Traveller ${i + 1}`}
              placeholder="Full name"
              value={n}
              onChangeText={(v) =>
                setNames((prev) => prev.map((x, idx) => (idx === i ? v : x)))
              }
            />
          ))}
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold text-ink-900">Contact details</Text>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone (for supplier contact)"
            placeholder="+1 555 010 0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {error ? (
          <View className="bg-danger-50 rounded-xl px-4 py-3">
            <Text className="text-sm text-danger-600">{error}</Text>
          </View>
        ) : null}

        <Button title="Continue to payment" size="lg" block onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}
