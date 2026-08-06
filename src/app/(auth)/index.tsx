import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/auth/sessionStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { APP_NAME, APP_TAGLINE } from "@/config";
import { isValidEmail } from "@/utils/format";

const DEMO_FILLS = [
  { label: "Customer demo", email: "customer@demo.com" },
  { label: "Supplier demo", email: "supplier@demo.com" },
];

export default function LoginScreen() {
  const { signIn } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      // Role-based redirect happens automatically via Stack.Protected guards.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
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
          <View className="items-center mb-8">
            <View className="h-20 w-20 rounded-3xl bg-brand-600 items-center justify-center shadow-lg">
              <Text className="text-4xl">✈️</Text>
            </View>
            <Text className="mt-4 text-3xl font-extrabold text-ink-900">
              {APP_NAME}
            </Text>
            <Text className="mt-1 text-sm text-ink-500 text-center">
              {APP_TAGLINE}
            </Text>
          </View>

          <View className="gap-4">
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
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? (
              <View className="bg-danger-50 rounded-xl px-4 py-3">
                <Text className="text-sm text-danger-600">{error}</Text>
              </View>
            ) : null}

            <Button
              title="Sign in"
              size="lg"
              block
              loading={submitting}
              onPress={onSubmit}
            />

            <Pressable onPress={() => router.push("/forgot-password")}>
              <Text className="text-center text-sm font-medium text-brand-600">
                Forgot password?
              </Text>
            </Pressable>
          </View>

          <View className="mt-8">
            <Text className="text-center text-xs text-ink-400 mb-3">
              DEMO — tap to fill credentials (any password works)
            </Text>
            <View className="flex-row justify-center gap-3">
              {DEMO_FILLS.map((f) => (
                <Pressable
                  key={f.email}
                  onPress={() => {
                    setEmail(f.email);
                    setPassword("demo1234");
                    setError(null);
                  }}
                  className="bg-white border border-ink-200 rounded-full px-4 py-2"
                >
                  <Text className="text-xs font-medium text-ink-700">{f.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-8 flex-row justify-center items-center gap-1">
            <Text className="text-sm text-ink-500">New to {APP_NAME}?</Text>
            <Link href="/register" asChild>
              <Pressable>
                <Text className="text-sm font-semibold text-brand-600">Create account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
