import type { KycStatus } from "@/types/kyc";

export interface KycStatusResult {
  status: KycStatus | null;
  feedback: string[];
  error: string | null;
}

export async function checkKycStatus(userId: string): Promise<KycStatusResult> {
  if (!userId) return { status: null, feedback: [], error: "No user ID" };

  try {
    // Use web admin API (service_role) — direct Supabase queries fail due to
    // profiles table RLS infinite recursion
    const kyResp = await fetch("https://travelnest-jet.vercel.app/api/admin/kyc");
    if (!kyResp.ok) {
      return { status: null, feedback: [], error: "Admin API failed" };
    }

    const allKyc: Array<{
      user_id: string;
      status: string;
      audit_reasons: unknown;
    }> = await kyResp.json();

    const myKyc = allKyc.find((r) => r.user_id === userId);
    if (!myKyc) {
      return { status: null, feedback: [], error: null };
    }

    const feedback = Array.isArray(myKyc.audit_reasons)
      ? myKyc.audit_reasons
      : [];

    return {
      status: myKyc.status as KycStatus,
      feedback,
      error: null,
    };
  } catch (e) {
    console.error("[KYC STATUS] exception", e);
    return {
      status: null,
      feedback: [],
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
