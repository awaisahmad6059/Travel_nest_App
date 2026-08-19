import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { File as ExpoFile } from "expo-file-system";

import { supabase } from "@/lib/supabase";
import { fileSystemStorage } from "@/lib/fileSystemStorage";
import { useSession } from "@/auth/sessionStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";

const PENDING_KYC_KEY = "@travelnest_pending_kyc";

async function uploadPendingKyc(userId: string, kycData: any) {
  const documents: any[] = [];

  async function uploadFile(fileUri: string | null, docType: string) {
    if (!fileUri) return null;
    const ext = fileUri.split(".").pop() || "jpg";
    const filePath = `${userId}/${Date.now()}-${docType.toLowerCase()}.${ext}`;
    const bytes = await new ExpoFile(fileUri).bytes();
    const { error: storageError } = await supabase.storage
      .from("kyc-documents")
      .upload(filePath, bytes, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}` });
    if (storageError) throw storageError;
    return {
      doc_id: `doc-${Date.now()}-${documents.length + 1}`,
      status: "PENDING",
      doc_type: docType,
      file_name: fileUri.split("/").pop() || "document",
      file_path: filePath,
    };
  }

  if (kycData.businessType === "solo") {
    const doc = await uploadFile(kycData.solo?.idFile, "CNIC/Passport");
    if (doc) documents.push(doc);
  } else if (kycData.businessType === "company") {
    const regDoc = await uploadFile(kycData.company?.regDoc, "Business Registration");
    if (regDoc) documents.push(regDoc);
    const insDoc = await uploadFile(kycData.company?.insDoc, "Insurance Certificate");
    if (insDoc) documents.push(insDoc);
    const leadDoc = await uploadFile(kycData.company?.leadIdFile, "CNIC/Passport");
    if (leadDoc) documents.push(leadDoc);
  }

  // Insert a single row with ALL fields the web admin panel expects
  const isSolo = kycData.businessType === "solo";
  const row: Record<string, unknown> = {
    user_id: userId,
    company_name: isSolo ? (kycData.fullName || "Solo Operator") : (kycData.company?.name || "Company"),
    business_type: isSolo ? "SOLO" : "COMPANY",
    location: isSolo ? kycData.solo?.location : kycData.company?.location,
    phone: isSolo ? kycData.solo?.phone : kycData.company?.phone,
    currency: isSolo ? kycData.solo?.currency : kycData.company?.leadCurrency,
    business_reg: isSolo ? kycData.solo?.cnic : kycData.company?.regNo,
    tax_id: isSolo ? kycData.solo?.taxId : kycData.company?.taxId,
    status: "PENDING",
    documents,
    audit_reasons: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: dbError } = await supabase.from("supplier_kyc_records").insert(row);
  if (dbError) throw dbError;
}

export default function SupplierLoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ signupSuccess?: string }>();
  const { setSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSupplierLogin() {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Login failed.");
        setLoading(false);
        return;
      }

      const name = data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? "Supplier";

      const userObj = {
        id: data.user.id,
        name,
        email: data.user.email ?? "",
        role: "supplier" as const,
        avatarEmoji: "🏔️",
      };

      const userSession = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: userObj,
      };

      // Check for pending KYC from signup BEFORE setting session.
      // If pending KYC exists, this is a fresh signup — keep user in auth flow
      // so (auth)/pending-approval is accessible.
      const pendingRaw = await fileSystemStorage.getItem(PENDING_KYC_KEY);
      if (pendingRaw) {
        try {
          const pendingKyc = JSON.parse(pendingRaw);
          if (pendingKyc.userId === data.user.id) {
            // Try upload with retry (user may not be fully committed in auth.users yet)
            for (let attempt = 1; attempt <= 3; attempt++) {
              try {
                await uploadPendingKyc(data.user.id, pendingKyc);
                break;
              } catch (uploadErr) {
                console.error(`[KYC UPLOAD] attempt ${attempt} failed`, uploadErr);
                if (attempt < 3) await new Promise((r) => setTimeout(r, 1500));
              }
            }
            await fileSystemStorage.removeItem(PENDING_KYC_KEY);
            // Navigate to pending-approval while still in auth flow (no setSession yet)
            router.replace("/pending-approval");
            return;
          }
        } catch (kycErr) {
          console.error("[KYC]", kycErr);
          await fileSystemStorage.removeItem(PENDING_KYC_KEY);
        }
      }

      // Check KYC status via web admin API (uses service_role, bypasses RLS).
      // This is the only reliable way since profiles RLS causes infinite recursion.
      try {
        const kyResp = await fetch("https://travelnest-jet.vercel.app/api/admin/kyc");
        if (kyResp.ok) {
          const allKyc: Array<{
            user_id: string;
            status: string;
            audit_reasons: unknown;
          }> = await kyResp.json();
          const myKyc = allKyc.find((r) => r.user_id === data.user.id);

          if (myKyc) {
            const kycStatus = myKyc.status;
            const feedback = Array.isArray(myKyc.audit_reasons)
              ? myKyc.audit_reasons
              : [];
            const feedbackJson = encodeURIComponent(JSON.stringify(feedback));

            if (kycStatus === "PENDING") {
              setSession(userSession);
              router.replace("/pending-approval");
              return;
            }
            if (kycStatus === "CHANGES_REQUESTED") {
              setSession(userSession);
              router.replace({
                pathname: "/kyc-action-required",
                params: { feedback: feedbackJson, userId: data.user.id },
              });
              return;
            }
            if (kycStatus === "REJECTED") {
              setSession(userSession);
              router.replace({
                pathname: "/kyc-rejected",
                params: { feedback: feedbackJson },
              });
              return;
            }
            if (kycStatus === "SUSPENDED") {
              setSession(userSession);
              router.replace("/kyc-suspended");
              return;
            }
            // APPROVED → continue to dashboard
          } else {
            console.warn("[KYC] No KYC record found for user", data.user.id);
          }
        }
      } catch (statusErr) {
        console.error("[KYC STATUS CHECK] exception", statusErr);
      }

      // All checks passed — set session and go to dashboard
      setSession(userSession);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentContainerClassName="flex-1 justify-center px-6 py-10">
      <View className="items-center mb-6">
        <View className="h-20 w-20 rounded-3xl items-center justify-center mb-4" style={{ backgroundColor: "#ede9fe" }}>
          <Text className="text-4xl">🏔️</Text>
        </View>
        <Text className="text-3xl font-extrabold text-ink-900 text-center">
          Supplier Portal
        </Text>
        <Text className="text-lg text-ink-600 mt-2 text-center">
          Sign in to manage your listings
        </Text>
      </View>

      {params.signupSuccess === "1" ? (
        <View className="bg-success-50 rounded-xl p-4 border border-success-200 mb-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
            <Text className="text-sm font-bold text-success-800">
              Account created!
            </Text>
          </View>
          <Text className="text-sm text-success-700">
            Please confirm your email, then sign in to complete your verification.
          </Text>
        </View>
      ) : null}

      <View className="gap-4">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="supplier@example.com"
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

        {error ? (
          <Text className="text-sm text-danger-600">{error}</Text>
        ) : null}

        <Button
          title="Sign In as Supplier"
          size="lg"
          block
          loading={loading}
          onPress={handleSupplierLogin}
        />

        <View className="flex-row items-center gap-3 my-1">
          <View className="h-px flex-1 bg-ink-100" />
          <Text className="text-xs text-ink-400">new here?</Text>
          <View className="h-px flex-1 bg-ink-100" />
        </View>

        <Button
          title="Create Supplier Account"
          variant="secondary"
          size="lg"
          block
          onPress={() => router.push("/supplier-signup")}
        />
      </View>

      <View className="items-center mt-8 pt-5 border-t border-ink-100">
        <Pressable onPress={() => router.replace("/")} className="flex-row items-center gap-1">
          <Ionicons name="arrow-back" size={16} color="#6b7280" />
          <Text className="text-ink-500 text-sm">Back to Travel</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
