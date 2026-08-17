/**
 * App-wide configuration.
 *
 * Each domain has its own mock switch. True = the service layer returns
 * hardcoded demo data; false = it hits the real production backend
 * (https://travelnest-5ttl.onrender.com/api/v1). See API_HANDOFF.md for the
 * backend status per module.
 *
 * Real (backend live — §4.1–4.3, reviews, AI):
 *   listings/search/detail, availability/slots/hold, bookings/checkout,
 *   reviews (list/create/helpful), AI chat + contextual QA + review summary
 * Mock (backend not built yet — §5.1, §5.3):
 *   auth/login, wishlist, supplier panel, payments (no gateway),
 *   push (no mobile module)
 *
 * The wishlist is a client-side Zustand store and has no API flag.
 *
 * Override the base URL at build/run time with EXPO_PUBLIC_API_URL (e.g. for
 * local development against a local NestJS instance).
 */

export const USE_MOCKS_LISTINGS = false;
export const USE_MOCKS_AVAILABILITY = false;
export const USE_MOCKS_BOOKINGS = false;
export const USE_MOCKS_AUTH = false;
export const USE_MOCKS_REVIEWS = false;
export const USE_MOCKS_SUPPLIER = false;
export const USE_MOCKS_PAYMENTS = true;
export const USE_MOCKS_AI = false;
export const USE_MOCKS_PUSH = true;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://travelnest-5ttl.onrender.com/api/v1";

/** Expo/Cloudinary image delivery base — used only when real image URLs exist. */
export const IMAGE_BASE_URL = "https://res.cloudinary.com/travelnest/image/upload/";

/** App metadata used in a few places (about screens, headers). */
export const APP_NAME = "TravelNest";
export const APP_TAGLINE = "Discover & book experiences worldwide";
