import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { cn } from "@/utils/cn";

type Step = 1 | 2 | 3;
type BusinessType = "solo" | "company" | null;

const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "AED", "JPY", "SAR", "TRY"];

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-1">
      <Ionicons name={icon as any} size={18} color="#7c3aed" />
      <Text className="text-sm font-extrabold text-ink-900">{title}</Text>
    </View>
  );
}

function FilePicker({
  label,
  file,
  onPick,
}: {
  label: string;
  file: string | null;
  onPick: (uri: string | null) => void;
}) {
  async function pick() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to upload documents.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) onPick(res.assets[0].uri);
  }

  return (
    <View>
      <Text className="text-xs font-bold text-ink-500 mb-1">{label}</Text>
      {file ? (
        <View className="flex-row items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
          <Ionicons name="document-attach-outline" size={18} color="#7c3aed" />
          <Text className="text-sm text-violet-700 flex-1" numberOfLines={1}>
            {file.split("/").pop()}
          </Text>
          <Pressable onPress={() => onPick(null)}>
            <Ionicons name="close-circle" size={20} color="#ef4444" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={pick}
          className="border-2 border-dashed border-ink-200 rounded-xl px-4 py-4 items-center"
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#7c3aed" />
          <Text className="text-xs text-ink-500 mt-1">Tap to upload</Text>
        </Pressable>
      )}
    </View>
  );
}

const PENDING_KYC_KEY = "@travelnest_pending_kyc";

export default function SupplierSignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [businessType, setBusinessType] = useState<BusinessType>(null);

  const [soloLocation, setSoloLocation] = useState("");
  const [soloPhone, setSoloPhone] = useState("");
  const [soloCnic, setSoloCnic] = useState("");
  const [soloTaxId, setSoloTaxId] = useState("");
  const [soloCurrency, setSoloCurrency] = useState(CURRENCIES[0]);
  const [soloCurrencyOpen, setSoloCurrencyOpen] = useState(false);
  const [soloIdFile, setSoloIdFile] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyRegNo, setCompanyRegNo] = useState("");
  const [companyTaxId, setCompanyTaxId] = useState("");
  const [companyRegDoc, setCompanyRegDoc] = useState<string | null>(null);
  const [companyInsDoc, setCompanyInsDoc] = useState<string | null>(null);

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCurrency, setLeadCurrency] = useState(CURRENCIES[0]);
  const [leadCurrencyOpen, setLeadCurrencyOpen] = useState(false);
  const [leadIdFile, setLeadIdFile] = useState<string | null>(null);

  function goNext() {
    setError(null);
    if (step === 1) {
      if (!fullName.trim()) return setError("Please enter your full name.");
      if (!email.trim()) return setError("Please enter your email address.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
      handleSignUp();
    } else if (step === 2) {
      if (!businessType) return setError("Please select your business type.");
      setStep(3);
    }
  }

  function goBack() {
    setError(null);
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else router.back();
  }

  async function handleSignUp() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: "supplier",
            full_name: fullName.trim(),
          },
        },
      });
      if (signUpError) throw signUpError;

      if (data.user?.id) setUserId(data.user.id);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    if (businessType === "solo") {
      if (!soloLocation.trim()) return setError("Please enter your location.");
      if (!soloPhone.trim()) return setError("Please enter your phone number.");
      if (!soloCnic.trim()) return setError("Please enter your CNIC/Passport number.");
    } else {
      if (!companyName.trim()) return setError("Please enter your company name.");
      if (!companyLocation.trim()) return setError("Please enter company location.");
      if (!companyEmail.trim()) return setError("Please enter company email.");
      if (!leadName.trim()) return setError("Please enter lead operator name.");
      if (!leadPhone.trim()) return setError("Please enter lead operator phone.");
    }

    setLoading(true);
    try {
      if (!userId) throw new Error("Account not created. Please start over.");

      const pendingKyc = {
        userId,
        fullName: fullName.trim(),
        businessType,
        solo: { location: soloLocation, phone: soloPhone, cnic: soloCnic, taxId: soloTaxId, currency: soloCurrency, idFile: soloIdFile },
        company: { name: companyName, location: companyLocation, email: companyEmail, phone: companyPhone, regNo: companyRegNo, taxId: companyTaxId, regDoc: companyRegDoc, insDoc: companyInsDoc, leadName, leadEmail, leadPhone, leadCurrency, leadIdFile },
      };
      await AsyncStorage.setItem(PENDING_KYC_KEY, JSON.stringify(pendingKyc));

      Alert.alert(
        "Account Created",
        "Please sign in to complete your verification.",
        [{ text: "OK", onPress: () => router.replace({ pathname: "/supplier-login", params: { signupSuccess: "1" } }) }],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function renderStepIndicator() {
    return (
      <View className="flex-row items-center justify-center gap-2 mb-6">
        <View style={{ height: 6, width: 36, borderRadius: 100, backgroundColor: "#16a34a" }} />
        <View style={{ height: 6, width: step >= 2 ? 36 : 16, borderRadius: 100, backgroundColor: step >= 2 ? "#7c3aed" : "#e2e8f0" }} />
        <View style={{ height: 6, width: step >= 3 ? 36 : 16, borderRadius: 100, backgroundColor: step >= 3 ? "#7c3aed" : "#e2e8f0" }} />
      </View>
    );
  }

  function renderCurrencyDropdown(
    open: boolean,
    setOpen: (v: boolean) => void,
    value: string,
    setValue: (v: string) => void,
  ) {
    return (
      <View>
        <Pressable
          onPress={() => setOpen(!open)}
          style={{ borderColor: "#cbd5e1" }}
          className="bg-white border rounded-xl px-4 py-3 flex-row items-center justify-between"
        >
          <Text className="text-base text-ink-900">{value}</Text>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
        </Pressable>
        {open ? (
          <View style={{ borderColor: "#cbd5e1" }} className="border border-ink-200 rounded-xl mt-1 bg-white overflow-hidden">
            {CURRENCIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => { setValue(c); setOpen(false); }}
                style={{ borderBottomColor: "#f1f5f9", backgroundColor: value === c ? "#f5f3ff" : "#ffffff" }}
                className="px-4 py-3 border-b border-ink-100"
              >
                <Text className={cn("text-sm", value === c ? "font-bold" : "text-ink-700")} style={{ color: value === c ? "#6d28d9" : undefined }}>{c}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  /* ─── Step 1: Account ─── */
  if (step === 1) {
    return (
      <SafeAreaView className="flex-1 bg-surface-100">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerClassName="flex-1 justify-center px-6 py-10" keyboardShouldPersistTaps="handled">
            <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-1">
              <Ionicons name="chevron-back" size={20} color="#0a54d9" />
              <Text className="text-sm font-medium text-brand-600">Back</Text>
            </Pressable>

            <View className="bg-white rounded-3xl p-8 shadow-sm">
              {renderStepIndicator()}
              <View className="flex-row items-center justify-center gap-1.5 mb-3">
                <View style={{ backgroundColor: "#ede9fe" }} className="rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                  <Ionicons name="shield-checkmark" size={14} color="#7c3aed" />
                  <Text style={{ color: "#6d28d9" }} className="text-xs font-bold">TravelNest Partner Portal</Text>
                </View>
              </View>
              <Text className="text-2xl font-extrabold text-ink-900 text-center">Create Your Supplier Account</Text>
              <Text className="text-sm text-ink-500 text-center mt-1 mb-6">Start listing your tours &amp; experiences in minutes</Text>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-bold text-ink-700 mb-1.5">Full Name</Text>
                  <Input placeholder="Name" value={fullName} onChangeText={setFullName} />
                </View>
                <View>
                  <Text className="text-sm font-bold text-ink-700 mb-1.5">Email Address</Text>
                  <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
                </View>
                <View>
                  <Text className="text-sm font-bold text-ink-700 mb-1.5">Password</Text>
                  <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                </View>

                {error ? (
                  <View className="bg-danger-50 rounded-xl px-4 py-3">
                    <Text className="text-sm text-danger-600">{error}</Text>
                  </View>
                ) : null}

                <Button title="Continue to Partner Setup" size="lg" block loading={loading} disabled={loading} onPress={goNext} />
              </View>
            </View>

            <View className="flex-row justify-center gap-1 mt-6">
              <Text className="text-ink-500 text-sm">Already have an account?</Text>
              <Pressable onPress={() => router.back()}>
                <Text className="font-semibold text-brand-600 text-sm"> Sign In</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ─── Step 2: Business Type ─── */
  if (step === 2) {
    return (
      <SafeAreaView className="flex-1 bg-surface-100">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerClassName="flex-1 justify-center px-6 py-10">
            <Pressable onPress={goBack} className="mb-4 flex-row items-center gap-1">
              <Ionicons name="chevron-back" size={20} color="#0a54d9" />
              <Text className="text-sm font-medium text-brand-600">Back</Text>
            </Pressable>

            <View className="bg-white rounded-3xl p-8 shadow-sm">
              {renderStepIndicator()}
              <View className="flex-row items-center justify-center gap-1.5 mb-3">
                <View style={{ backgroundColor: "#ede9fe" }} className="rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                  <Ionicons name="shield-checkmark" size={14} color="#7c3aed" />
                  <Text style={{ color: "#6d28d9" }} className="text-xs font-bold">Complete Your Profile</Text>
                </View>
              </View>
              <Text className="text-2xl font-extrabold text-ink-900 text-center">Business Structure</Text>
              <Text className="text-sm text-ink-500 text-center mt-1 mb-6">Select the type that best describes your business</Text>

              <View className="gap-3">
                <Pressable
                  onPress={() => setBusinessType("solo")}
                  style={{ borderColor: businessType === "solo" ? "#8b5cf6" : "#e2e8f0", backgroundColor: businessType === "solo" ? "#f5f3ff" : "#ffffff" }}
                  className="rounded-2xl border-2 p-5"
                >
                  <View className="flex-row items-center gap-3">
                    <View style={{ backgroundColor: businessType === "solo" ? "#ede9fe" : "#f1f5f9" }} className="h-12 w-12 rounded-xl items-center justify-center">
                      <Text className="text-2xl">{"\uD83D\uDC64"}</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: businessType === "solo" ? "#6d28d9" : "#0f172a" }} className="text-base font-bold">Solo Operator / Individual Guide</Text>
                      <Text className="text-xs text-ink-500 mt-0.5">I operate as an individual tour guide or freelancer</Text>
                    </View>
                    <Ionicons name={businessType === "solo" ? "radio-button-on" : "radio-button-off"} size={22} color={businessType === "solo" ? "#7c3aed" : "#cbd5e1"} />
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => setBusinessType("company")}
                  style={{ borderColor: businessType === "company" ? "#8b5cf6" : "#e2e8f0", backgroundColor: businessType === "company" ? "#f5f3ff" : "#ffffff" }}
                  className="rounded-2xl border-2 p-5"
                >
                  <View className="flex-row items-center gap-3">
                    <View style={{ backgroundColor: businessType === "company" ? "#ede9fe" : "#f1f5f9" }} className="h-12 w-12 rounded-xl items-center justify-center">
                      <Text className="text-2xl">{"\uD83C\uDFE2"}</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: businessType === "company" ? "#6d28d9" : "#0f172a" }} className="text-base font-bold">Registered Travel Company</Text>
                      <Text className="text-xs text-ink-500 mt-0.5">I represent a registered business or travel agency</Text>
                    </View>
                    <Ionicons name={businessType === "company" ? "radio-button-on" : "radio-button-off"} size={22} color={businessType === "company" ? "#7c3aed" : "#cbd5e1"} />
                  </View>
                </Pressable>
              </View>

              {error ? (
                <View className="bg-danger-50 rounded-xl px-4 py-3 mt-4">
                  <Text className="text-sm text-danger-600">{error}</Text>
                </View>
              ) : null}

              <Button title="Continue" size="lg" block disabled={!businessType} onPress={goNext} className="mt-6" />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ─── Step 3: KYC Details ─── */
  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="px-6 py-8" keyboardShouldPersistTaps="handled">
          <Pressable onPress={goBack} className="mb-4 flex-row items-center gap-1">
            <Ionicons name="chevron-back" size={20} color="#0a54d9" />
            <Text className="text-sm font-medium text-brand-600">Back</Text>
          </Pressable>

          <View className="bg-white rounded-3xl p-6 shadow-sm mb-6">
            {renderStepIndicator()}
            <Text className="text-xl font-extrabold text-ink-900 text-center">
              {businessType === "solo" ? "Verification Details" : "Company & Verification Details"}
            </Text>
            <Text className="text-xs text-ink-500 text-center mt-1">Please provide your information and required verification documents.</Text>
          </View>

          {businessType === "solo" ? (
            <View className="bg-white rounded-3xl p-6 shadow-sm gap-4">
              <SectionTitle icon="person" title="Personal Information" />
              <View><Text className="text-xs font-bold text-ink-500 mb-1">Location (City, Country)</Text><Input value={soloLocation} onChangeText={setSoloLocation} placeholder="e.g. Lahore, Pakistan" /></View>
              <View><Text className="text-xs font-bold text-ink-500 mb-1">Mobile Phone</Text><Input value={soloPhone} onChangeText={setSoloPhone} placeholder="+92 300 1234567" keyboardType="phone-pad" /></View>
              <View className="h-px bg-ink-100 my-1" />
              <SectionTitle icon="document-text" title="Identification" />
              <View><Text className="text-xs font-bold text-ink-500 mb-1">CNIC / Passport Number</Text><Input value={soloCnic} onChangeText={setSoloCnic} placeholder="e.g. 35202-1234567-1" /></View>
              <View><Text className="text-xs font-bold text-ink-500 mb-1">Tax ID / NTN</Text><Input value={soloTaxId} onChangeText={setSoloTaxId} placeholder="Tax Registration Number" /></View>
              <View className="h-px bg-ink-100 my-1" />
              <SectionTitle icon="wallet" title="Payout & Documents" />
              <View>
                <Text className="text-xs font-bold text-ink-500 mb-1">Preferred Payout Currency</Text>
                {renderCurrencyDropdown(soloCurrencyOpen, setSoloCurrencyOpen, soloCurrency, setSoloCurrency)}
              </View>
              <FilePicker label="ID Card Document (CNIC/Passport)" file={soloIdFile} onPick={setSoloIdFile} />
            </View>
          ) : (
            <View className="gap-4">
              <View className="bg-white rounded-3xl p-6 shadow-sm gap-4">
                <SectionTitle icon="business" title="Company Information" />
                <View><Text className="text-xs font-bold text-ink-500 mb-1">Company Name *</Text><Input value={companyName} onChangeText={setCompanyName} placeholder="e.g. TravelNest Voyages" /></View>
                <View><Text className="text-xs font-bold text-ink-500 mb-1">Company Location *</Text><Input value={companyLocation} onChangeText={setCompanyLocation} placeholder="e.g. Lahore, Pakistan" /></View>
                <View><Text className="text-xs font-bold text-ink-500 mb-1">Company Email *</Text><Input value={companyEmail} onChangeText={setCompanyEmail} placeholder="contact@company.com" keyboardType="email-address" autoCapitalize="none" /></View>
                <View><Text className="text-xs font-bold text-ink-500 mb-1">Company Contact Number *</Text><Input value={companyPhone} onChangeText={setCompanyPhone} placeholder="+92 42 35789000" keyboardType="phone-pad" /></View>
                <View><Text className="text-xs font-bold text-ink-500 mb-1">Company Registration # *</Text><Input value={companyRegNo} onChangeText={setCompanyRegNo} placeholder="Business Reg Number" /></View>
                <View><Text className="text-xs font-bold text-ink-500 mb-1">Corporate Tax ID / NTN *</Text><Input value={companyTaxId} onChangeText={setCompanyTaxId} placeholder="Tax Registration Number" /></View>
                <FilePicker label="Company Registration Doc *" file={companyRegDoc} onPick={setCompanyRegDoc} />
                <FilePicker label="Company Insurance Doc *" file={companyInsDoc} onPick={setCompanyInsDoc} />
              </View>

              <View className="bg-white rounded-3xl p-6 shadow-sm gap-4">
                <SectionTitle icon="person" title="Lead Representative Information" />
                <View><Text className="text-xs font-bold text-ink-500 mb-1">Lead Operator Name *</Text><Input value={leadName} onChangeText={setLeadName} placeholder="Full Name" /></View>
                <View><Text className="text-xs font-bold text-ink-500 mb-1">Lead Operator Email *</Text><Input value={leadEmail} onChangeText={setLeadEmail} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" /></View>
                <View><Text className="text-xs font-bold text-ink-500 mb-1">Lead Operator Phone *</Text><Input value={leadPhone} onChangeText={setLeadPhone} placeholder="+92 300 1234567" keyboardType="phone-pad" /></View>
                <View>
                  <Text className="text-xs font-bold text-ink-500 mb-1">Payout Currency *</Text>
                  {renderCurrencyDropdown(leadCurrencyOpen, setLeadCurrencyOpen, leadCurrency, setLeadCurrency)}
                </View>
                <FilePicker label="Lead Operator ID Card (CNIC / Passport) *" file={leadIdFile} onPick={setLeadIdFile} />
              </View>
            </View>
          )}

          {error ? (
            <View className="bg-danger-50 rounded-xl px-4 py-3 mt-4">
              <Text className="text-sm text-danger-600">{error}</Text>
            </View>
          ) : null}

          <Button title="Submit & Continue to Login" size="lg" block loading={loading} disabled={loading} onPress={handleSubmit} className="mt-6 mb-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
