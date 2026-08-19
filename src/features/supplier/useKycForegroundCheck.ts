import { useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { AppState, AppStateStatus } from "react-native";

import { useSession } from "@/auth/sessionStore";
import { checkKycStatus } from "@/lib/kycStatus";

export function useKycForegroundCheck() {
  const router = useRouter();
  const { user } = useSession();

  const check = useCallback(async () => {
    if (!user || user.role !== "supplier") return;

    const result = await checkKycStatus(user.id);
    if (result.error || !result.status) return;

    if (result.status === "APPROVED") return;

    const feedbackJson = encodeURIComponent(JSON.stringify(result.feedback));

    switch (result.status) {
      case "PENDING":
        router.replace("/pending-approval");
        break;
      case "CHANGES_REQUESTED":
        router.replace({
          pathname: "/kyc-action-required",
          params: { feedback: feedbackJson, userId: user.id },
        });
        break;
      case "REJECTED":
        router.replace({
          pathname: "/kyc-rejected",
          params: { feedback: feedbackJson },
        });
        break;
      case "SUSPENDED":
        router.replace("/kyc-suspended");
        break;
    }
  }, [user, router]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        void check();
      }
    });
    return () => sub.remove();
  }, [check]);
}
