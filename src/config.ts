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

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** Expo/Cloudinary image delivery base — used only when real image URLs exist. */
export const IMAGE_BASE_URL = "https://res.cloudinary.com/travelnest/image/upload/";

/** App metadata used in a few places (about screens, headers). */
export const APP_NAME = "TravelNest";
export const APP_TAGLINE = "Discover & book experiences worldwide";
