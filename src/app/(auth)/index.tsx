import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useSession } from "@/auth/sessionStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import type { User } from "@/types";
import { cn } from "@/utils/cn";

const ROLE_TABS: { key: User["role"]; label: string; sub: string }[] = [
  { key: "customer", label: "🧳 Travel", sub: "Find & book" },
  { key: "supplier", label: "🏔️ Supplier", sub: "Host & earn" },
];

const DEMO_EMAIL: Record<User["role"], string> = {
  customer: "customer@demo.com",
  supplier: "supplier@demo.com",
};

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useSession();
  const [role, setRole] = useState<User["role"]>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    const demoEmail = DEMO_EMAIL[role];
    setEmail(demoEmail);
    setPassword("demo1234");
    setLoading(true);
    setError(null);
    try {
      await signIn(demoEmail, "demo1234");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demo sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentContainerClassName="flex-1 justify-center px-6 py-10">
      <View className="items-center mb-6">
        <View className="h-20 w-20 rounded-3xl bg-brand-500 items-center justify-center mb-4">
          <Text className="text-4xl">🧳</Text>
        </View>
        <Text className="text-3xl font-extrabold text-ink-900 text-center">
          TravelNest
        </Text>
        <Text className="text-lg text-ink-600 mt-2 text-center">
          Sign in to continue
        </Text>
      </View>

      <View className="flex-row bg-ink-100 rounded-xl p-1 mb-6">
        {ROLE_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setRole(tab.key)}
            className={cn(
              "flex-1 py-2.5 rounded-lg items-center",
              role === tab.key ? "bg-white" : "",
            )}
          >
            <Text
              className={cn(
                "text-sm font-bold",
                role === tab.key ? "text-brand-600" : "text-ink-500",
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="gap-4">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder={role === "supplier" ? "supplier@demo.com" : "you@example.com"}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <Pressable onPress={() => router.push("/forgot-password")}>
          <Text className="text-sm font-semibold text-brand-600 text-right">
            Forgot password?
          </Text>
        </Pressable>

        {error ? <Text className="text-sm text-danger-600">{error}</Text> : null}

        <Button
          title="Sign In"
          size="lg"
          block
          loading={loading}
          onPress={handleSignIn}
        />

        <View className="flex-row items-center gap-3 my-1">
          <View className="h-px flex-1 bg-ink-100" />
          <Text className="text-xs text-ink-400">or</Text>
          <View className="h-px flex-1 bg-ink-100" />
        </View>

        <Button
          title="⚡ Demo Login (one tap)"
          variant="accent"
          size="lg"
          block
          disabled={loading}
          onPress={handleDemoLogin}
        />
        <Text className="text-xs text-ink-400 text-center">
          {role === "supplier"
            ? "Logs in as supplier@demo.com → Supplier Panel"
            : "Logs in as customer@demo.com → Customer Panel"}
        </Text>
      </View>

      <View className="flex-row justify-center gap-1 mt-8">
        <Text className="text-ink-500">Don&apos;t have an account?</Text>
        <Pressable onPress={() => router.push("/register")}>
          <Text className="font-semibold text-brand-600">Create one</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
