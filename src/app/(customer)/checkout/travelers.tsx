import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { useBookingDraft } from "@/store/bookingDraftStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useSession } from "@/auth/sessionStore";
import { useTravelersStore } from "@/store/travelersStore";
import { isValidEmail, isValidPhone } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function TravelersScreen() {
  const router = useRouter();
  const { draft } = useBookingDraft();
  const count = draft?.quantity ?? 1;
  const { user } = useSession();
  const {
    contactName,
    contactEmail,
    contactPhone,
    pickupLocation,
    dropoffLocation,
    setTravelers,
    setContact,
    setLocations,
  } = useCheckoutStore();

  const [name, setName] = useState(contactName || user?.name || "");
  const [email, setEmail] = useState(contactEmail || user?.email || "");
  const [phone, setPhone] = useState(contactPhone || user?.phone || "");
  const [pickup, setPickup] = useState(pickupLocation || "");
  const [dropoff, setDropoff] = useState(dropoffLocation || "");
  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saved = useTravelersStore((s) => s.travelers);

  // Tapping a saved traveller fills the customer name field.
  function fillFromSaved(savedName: string) {
    setName(savedName);
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
      return setError("Please enter the customer's name.");
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
    setTravelers([
      {
        id: `tr_${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      },
    ]);
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
        {saved.length > 0 ? (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-ink-900">
              Saved travellers
            </Text>
            <Text className="text-xs text-ink-400">
              Tap a saved traveller to auto-fill the customer name.
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
                  selected={name === t.name}
                  onPress={() => fillFromSaved(t.name)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View className="gap-3">
          <Text className="text-sm font-semibold text-ink-900">
            Customer details
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
