/**
 * App-wide configuration.
 *
 * USE_MOCKS controls whether the service layer returns hardcoded dummy data
 * or hits the real backend. Flip it to `false` (and update API_BASE_URL)
 * when the real TravelNest API documentation is ready — no UI components
 * need to change.
 */

export const USE_MOCKS = true;

/** Placeholder API base URL — replace with the real backend URL when available. */
export const API_BASE_URL = "https://api.travelnest.example/v1";

/** Expo/Cloudinary image delivery base — used only when real image URLs exist. */
export const IMAGE_BASE_URL = "https://res.cloudinary.com/travelnest/image/upload/";

/** App metadata used in a few places (about screens, headers). */
export const APP_NAME = "TravelNest";
export const APP_TAGLINE = "Discover & book experiences worldwide";
