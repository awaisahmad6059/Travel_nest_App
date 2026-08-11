import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { useCart } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useSession } from "@/auth/sessionStore";
import { useTravelersStore } from "@/store/travelersStore";
import { isValidEmail, isValidPhone } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function TravelersScreen() {
  const router = useRouter();
  const { count } = useCart();
  const { user } = useSession();
  const {
    travelers,
    contactName,
    contactEmail,
    contactPhone,
    pickupLocation,
    dropoffLocation,
    setTravelers,
    setContact,
    setLocations,
  } = useCheckoutStore();

  const [names, setNames] = useState<string[]>(
    Array.from({ length: count }).map((_, i) => travelers[i]?.name ?? (i === 0 ? user?.name ?? "" : "")),
  );
  const [name, setName] = useState(contactName || user?.name || "");
  const [email, setEmail] = useState(contactEmail || user?.email || "");
  const [phone, setPhone] = useState(contactPhone || user?.phone || "");
  const [pickup, setPickup] = useState(pickupLocation || "");
  const [dropoff, setDropoff] = useState(dropoffLocation || "");
  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saved = useTravelersStore((s) => s.travelers);

  function fillFromSaved(travellerName: string) {
    const emptyIdx = names.findIndex((n) => !n.trim());
    if (emptyIdx >= 0) {
      setNames((prev) => prev.map((x, i) => (i === emptyIdx ? travellerName : x)));
      return;
    }
    if (!name.trim()) {
      setName(travellerName);
      return;
    }
    Alert.alert("All filled", "Every traveller and the lead contact name are already filled in.");
  }

  function onPickupChange(v: string) {
    setPickup(v);
    if (sameAsPickup) setDropoff(v);
  }

  function toggleSameAsPickup() {
    setSameAsPickup((prev) => {
      const next = !prev;
      if (next) setDropoff(pickup);
      return next;
    });
  }

  function onContinue() {
    if (!name.trim()) {
      return setError("Please enter the lead traveller's name.");
    }
    if (names.some((n) => !n.trim())) {
      return setError("Please fill in every traveller's name.");
    }
    if (!isValidEmail(email)) {
      return setError("Please enter a valid contact email.");
    }
    if (phone && !isValidPhone(phone)) {
      return setError("Please enter a valid phone number.");
    }
    if (!pickup.trim()) {
      return setError("Please enter a pickup location.");
    }
    const finalDropoff = sameAsPickup ? pickup : dropoff;
    if (!finalDropoff.trim()) {
      return setError("Please enter a drop-off location.");
    }
    setError(null);
    const updated = names.map((n, i) => ({
      id: `tr_${Date.now()}_${i}`,
      name: n.trim(),
    }));
    setTravelers(updated);
    setContact({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    setLocations(pickup.trim(), finalDropoff.trim());
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

      <ScrollView
        contentContainerClassName="px-5 py-5 gap-5 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <Text className="text-sm font-semibold text-ink-900">
            Traveller{count > 1 ? "s" : ""}
          </Text>
          {saved.length > 0 ? (
            <View className="gap-2">
              <Text className="text-xs text-ink-400">
                Saved travellers — tap to auto-fill the next empty field
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 pr-4"
              >
                {saved.map((t) => (
                  <Chip
                    key={t.id}
                    label={t.name}
                    onPress={() => fillFromSaved(t.name)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
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
          <Text className="text-sm font-semibold text-ink-900">
            Lead traveller & contact
          </Text>
          <Input
            label="Customer name"
            placeholder="Full name"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Mobile number"
            placeholder="+1 555 010 0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold text-ink-900">
            Pickup & drop-off
          </Text>
          <Input
            label="Pickup location"
            placeholder="e.g. Naran Main Bazaar"
            value={pickup}
            onChangeText={onPickupChange}
          />
          <Input
            label="Drop-off location"
            placeholder="e.g. Naran Main Bazaar"
            value={sameAsPickup ? pickup : dropoff}
            onChangeText={setDropoff}
            editable={!sameAsPickup}
            hint={sameAsPickup ? "Auto-filled from pickup location." : undefined}
          />
          <Pressable
            onPress={toggleSameAsPickup}
            className="flex-row items-center gap-2 py-1"
          >
            <View
              className={cn(
                "h-5 w-5 rounded-md border items-center justify-center",
                sameAsPickup
                  ? "bg-brand-600 border-brand-600"
                  : "border-ink-300 bg-white",
              )}
            >
              {sameAsPickup ? (
                <Ionicons name="checkmark" size={14} color="#ffffff" />
              ) : null}
            </View>
            <Text className="text-sm text-ink-700">Same as pickup location</Text>
          </Pressable>
        </View>

        {error ? (
          <View className="bg-danger-50 rounded-xl px-4 py-3">
            <Text className="text-sm text-danger-600">{error}</Text>
          </View>
        ) : null}

        <Button title="Continue to payment" size="lg" block onPress={onContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}
