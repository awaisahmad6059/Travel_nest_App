import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * App-wide configuration.
 *
 * USE_MOCKS controls whether the service layer returns hardcoded dummy data
 * or hits the real backend (see API_HANDOFF.md). Flip it to `false` when the
 * NestJS backend is reachable — no UI components need to change.
 *
 * Real backend base URL (API_HANDOFF.md §1–2):
 *   - iOS simulator / web: http://localhost:4000/api/v1
 *   - Android emulator:    http://10.0.2.2:4000/api/v1
 *   - Physical device:     http://<your-LAN-IP>:4000/api/v1
 * Override at build/run time with EXPO_PUBLIC_API_URL.
 */

export const USE_MOCKS = true;

/**
 * Resolve the backend base URL for the current runtime (API_HANDOFF.md §2).
 *
 * Priority:
 *   1. `EXPO_PUBLIC_API_URL` if set (physical device → your LAN IP).
 *   2. The Metro dev-server host (Expo Go / dev builds). If the app was
 *      launched over LAN we reuse that machine's IP with the API port, which
 *      makes physical devices work without any config. If the dev server is
 *      on localhost we special-case the Android emulator (10.0.2.2).
 *   3. Platform default: Android emulator → 10.0.2.2, everything else → localhost.
 */
function defaultApiBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  const onLocalhost = !host || host === "localhost" || host === "127.0.0.1";

  if (host && !onLocalhost) {
    // Physical device / LAN dev server — reuse the Metro host IP.
    return `http://${host}:4000/api/v1`;
  }
  if (Platform.OS === "android") {
    // Android emulator reaches the host machine via 10.0.2.2.
    return "http://10.0.2.2:4000/api/v1";
  }
  // iOS simulator, web and everything else can use localhost directly.
  return "http://localhost:4000/api/v1";
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? defaultApiBaseUrl();

/** Expo/Cloudinary image delivery base — used only when real image URLs exist. */
export const IMAGE_BASE_URL = "https://res.cloudinary.com/travelnest/image/upload/";

/** App metadata used in a few places (about screens, headers). */
export const APP_NAME = "TravelNest";
export const APP_TAGLINE = "Discover & book experiences worldwide";
