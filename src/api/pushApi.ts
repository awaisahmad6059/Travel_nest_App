import { USE_MOCKS_PUSH } from "@/config";
import { request, mockDelay } from "./client";

/**
 * Push notifications — STUBBED. Expo Notifications + FCM/APNs credentials are
 * provided later. Registration is a no-op today but keeps the same signature
 * the real device-token endpoint will use (POST /mobile/devices).
 */
export const pushApi = {
  async registerDevice(_token: string, platform: "ios" | "android"): Promise<void> {
    if (USE_MOCKS_PUSH) {
      console.log(`[push:mock] registered ${platform} device ${_token.slice(0, 12)}…`);
      return mockDelay(undefined, 200);
    }
    await request("/mobile/devices", {
      method: "POST",
      body: JSON.stringify({ token: _token, platform }),
    });
  },
};
