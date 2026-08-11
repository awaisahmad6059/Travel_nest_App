import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { SubScreenHeader } from "@/components/profile/SubScreenHeader";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useTravelersStore,
  type SavedTraveler,
  type TravelerType,
} from "@/store/travelersStore";

const TYPES: TravelerType[] = ["Adult", "Child", "Infant", "Senior"];

const TRAVELER_TYPES: Record<TravelerType, string> = {
  Adult: "👤",
  Child: "🧒",
  Infant: "🍼",
  Senior: "🧓",
};

function TravellerForm({
  visible,
  onClose,
  initial,
}: {
  visible: boolean;
  onClose: () => void;
  initial?: SavedTraveler | null;
}) {
  const add = useTravelersStore((s) => s.add);
  const update = useTravelersStore((s) => s.update);

  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial?.age ?? "");
  const [type, setType] = useState<TravelerType>(initial?.type ?? "Adult");
  const [error, setError] = useState<string | null>(null);

  function save() {
    if (!name.trim()) return setError("Please enter the traveller's name.");
    const input = { name: name.trim(), age: age.trim() || undefined, type };
    if (initial) update(initial.id, input);
    else add(input);
    setName("");
    setAge("");
    setType("Adult");
    setError(null);
    onClose();
  }

  return (
    <Sheet
      visible={visible}
      title={initial ? "Edit traveller" : "Add traveller"}
      onClose={onClose}
      footer={<Button title={initial ? "Save changes" : "Add traveller"} onPress={save} block />}
    >
      <View className="gap-4">
        <Input
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Awais Ahmad"
        />
        <Input
          label="Age (optional)"
          value={age}
          onChangeText={(v) => setAge(v.replace(/\D/g, "").slice(0, 3))}
          placeholder="e.g. 28"
          keyboardType="number-pad"
        />
        <View className="gap-2">
          <Text className="text-sm font-medium text-ink-800">Traveller type</Text>
          <View className="flex-row flex-wrap gap-2">
            {TYPES.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={type === t}
                onPress={() => setType(t)}
              />
            ))}
          </View>
        </View>
        {error ? <Text className="text-sm text-danger-600">{error}</Text> : null}
      </View>
    </Sheet>
  );
}

export default function SavedTravellersScreen() {
  const { travelers, remove } = useTravelersStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SavedTraveler | null>(null);
  const [formKey, setFormKey] = useState(0);

  function openForm(initial: SavedTraveler | null) {
    setEditing(initial);
    setFormKey((k) => k + 1);
    setShowForm(true);
  }

  function confirmRemove(t: SavedTraveler) {
    Alert.alert("Remove traveller?", `${t.name} will be removed from saved travellers.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => remove(t.id) },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <SubScreenHeader title="Saved travellers" />

      {travelers.length === 0 ? (
        <EmptyState
          emoji="🧳"
          title="No saved travellers"
          message="Add the people you usually travel with so checkout is faster."
        />
      ) : (
        <ScrollView className="flex-1 px-5 pb-8" showsVerticalScrollIndicator={false}>
          <View className="gap-3">
            {travelers.map((t) => (
              <View
                key={t.id}
                className="bg-white rounded-2xl border border-ink-100 px-4 py-4 flex-row items-center gap-3"
              >
                <View className="h-10 w-10 rounded-full bg-brand-50 items-center justify-center">
                  <Text className="text-lg">{TRAVELER_TYPES[t.type]}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-ink-900">{t.name}</Text>
                  <Text className="text-xs text-ink-400">
                    {t.type}
                    {t.age ? ` · ${t.age} yrs` : ""}
                  </Text>
                </View>
                <Pressable
                  onPress={() => openForm(t)}
                  hitSlop={8}
                >
                  <Ionicons name="create-outline" size={20} color="#0a54d9" />
                </Pressable>
                <Pressable onPress={() => confirmRemove(t)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </Pressable>
              </View>
            ))}
          </View>
          <Button
            title="Add traveller"
            className="mt-6"
            onPress={() => openForm(null)}
            block
          />
        </ScrollView>
      )}

      {travelers.length === 0 ? (
        <View className="px-5 pb-8">
          <Button
            title="Add traveller"
            onPress={() => openForm(null)}
            block
          />
        </View>
      ) : null}

      <TravellerForm
        key={formKey}
        visible={showForm}
        onClose={() => setShowForm(false)}
        initial={editing}
      />
    </SafeAreaView>
  );
}
