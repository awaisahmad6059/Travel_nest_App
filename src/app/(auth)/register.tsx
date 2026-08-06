import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useSession } from "@/auth/sessionStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils/cn";
import { isValidEmail } from "@/utils/format";
import type { UserRole } from "@/types";

export default function RegisterScreen() {
  const { signUp } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!name.trim()) return setError("Please enter your full name.");
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setError(null);
    setSubmitting(true);
    try {
      await signUp({ name: name.trim(), email, password, role });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} className="mb-6 flex-row items-center gap-1">
            <Ionicons name="chevron-back" size={20} color="#0a54d9" />
            <Text className="text-sm font-medium text-brand-600">Back to sign in</Text>
          </Pressable>

          <Text className="text-2xl font-extrabold text-ink-900">Create account</Text>
          <Text className="mt-1 text-sm text-ink-500 mb-6">
            Join TravelNest to book experiences or sell yours.
          </Text>

          <View className="gap-4">
            <Input
              label="Full name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <Input
              label="Password"
              placeholder="Min 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Input
              label="Confirm password"
              placeholder="Repeat password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />

            <View>
              <Text className="text-sm font-medium text-ink-800 mb-2">I am a…</Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setRole("customer")}
                  className={cn(
                    "flex-1 rounded-2xl border px-4 py-3.5 items-center",
                    role === "customer" ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white",
                  )}
                >
                  <Text className="text-2xl">🧳</Text>
                  <Text className={cn("mt-1 text-sm font-semibold", role === "customer" ? "text-brand-700" : "text-ink-700")}>
                    Traveller
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setRole("supplier")}
                  className={cn(
                    "flex-1 rounded-2xl border px-4 py-3.5 items-center",
                    role === "supplier" ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white",
                  )}
                >
                  <Text className="text-2xl">🏔️</Text>
                  <Text className={cn("mt-1 text-sm font-semibold", role === "supplier" ? "text-brand-700" : "text-ink-700")}>
                    Supplier
                  </Text>
                </Pressable>
              </View>
            </View>

            {error ? (
              <View className="bg-danger-50 rounded-xl px-4 py-3">
                <Text className="text-sm text-danger-600">{error}</Text>
              </View>
            ) : null}

            <Button title="Create account" size="lg" block loading={submitting} onPress={onSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
