import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { SubScreenHeader } from "@/components/profile/SubScreenHeader";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePaymentMethodsStore } from "@/store/paymentMethodsStore";

function brandFromNumber(number: string): string {
  const n = number.replace(/\s/g, "");
  if (n.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  return "Card";
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function AddCardSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const addCard = usePaymentMethodsStore((s) => s.addCard);

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState<string | null>(null);

  function save() {
    const digits = number.replace(/\D/g, "");
    if (!name.trim()) return setError("Please enter the cardholder name.");
    if (digits.length < 12) return setError("Enter a valid card number.");
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return setError("Use the MM/YY format.");
    if (!/^\d{3,4}$/.test(cvc)) return setError("Enter a valid CVC.");

    const last4 = digits.slice(-4);
    addCard({
      id: `pm_${Date.now()}`,
      type: "card",
      label: `${brandFromNumber(digits)} •••• ${last4}`,
      detail: `Exp ${expiry}`,
    });
    setName("");
    setNumber("");
    setExpiry("");
    setCvc("");
    setError(null);
    onClose();
  }

  return (
    <Sheet visible={visible} title="Add payment method" onClose={onClose}
      footer={
        <Button title="Save card" onPress={save} block />
      }
    >
      <View className="gap-4">
        <Input label="Cardholder name" value={name} onChangeText={setName} placeholder="Name on card" />
        <Input
          label="Card number"
          value={number}
          onChangeText={(v) => setNumber(formatCardNumber(v))}
          placeholder="1234 5678 9012 3456"
          keyboardType="number-pad"
        />
        <View className="flex-row gap-3">
          <Input
            label="Expiry"
            value={expiry}
            onChangeText={(v) => setExpiry(formatExpiry(v))}
            placeholder="MM/YY"
            keyboardType="number-pad"
            className="flex-1"
          />
          <Input
            label="CVC"
            value={cvc}
            onChangeText={(v) => setCvc(v.replace(/\D/g, "").slice(0, 4))}
            placeholder="123"
            keyboardType="number-pad"
            secureTextEntry
            className="flex-1"
          />
        </View>
        {error ? <Text className="text-sm text-danger-600">{error}</Text> : null}
        <Text className="text-xs text-ink-400">
          Demo only — no card is charged and nothing is sent to a payment processor.
        </Text>
      </View>
    </Sheet>
  );
}

export default function PaymentMethodsScreen() {
  const { cards, removeCard } = usePaymentMethodsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [addKey, setAddKey] = useState(0);

  function confirmRemove(id: string, label: string) {
    Alert.alert("Remove card?", `${label} will be removed from your saved methods.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeCard(id) },
    ]);
  }

  function openAdd() {
    setAddKey((k) => k + 1);
    setShowAdd(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <SubScreenHeader title="Payment methods" />

      {cards.length === 0 ? (
        <EmptyState
          emoji="💳"
          title="No saved cards"
          message="Add a payment method so checkout is faster next time."
        />
      ) : (
        <ScrollView className="flex-1 px-5 pb-8" showsVerticalScrollIndicator={false}>
          <View className="gap-3">
            {cards.map((card) => (
              <View
                key={card.id}
                className="bg-white rounded-2xl border border-ink-100 px-4 py-4 flex-row items-center gap-3"
              >
                <View className="h-10 w-10 rounded-xl bg-brand-50 items-center justify-center">
                  <Ionicons name="card-outline" size={20} color="#0a54d9" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-ink-900">{card.label}</Text>
                  <Text className="text-xs text-ink-400">{card.detail}</Text>
                </View>
                <Pressable onPress={() => confirmRemove(card.id, card.label)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </Pressable>
              </View>
            ))}
          </View>
          <Button title="Add payment method" className="mt-6" onPress={openAdd} block />
          <Text className="text-center text-xs text-ink-400 mt-3">
            Cards are stored on your device only.
          </Text>
        </ScrollView>
      )}

      {cards.length === 0 ? (
        <View className="px-5 pb-8">
          <Button title="Add payment method" onPress={openAdd} block />
        </View>
      ) : null}

      <AddCardSheet key={addKey} visible={showAdd} onClose={() => setShowAdd(false)} />
    </SafeAreaView>
  );
}
