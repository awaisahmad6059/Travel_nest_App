import * as SecureStore from "expo-secure-store";

/**
 * Tiny JSON persistence helper for the new local profile stores
 * (payments, travellers, settings, profile). Uses expo-secure-store the same
 * way the session/voucher caches do, and fails soft when it's unavailable
 * (e.g. web / Expo Go on some platforms) so these stores stay session-only.
 */

const PREFIX = "travelnest.local.";

export async function loadLocalJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(`${PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function saveLocalJSON(key: string, value: unknown): Promise<void> {
  try {
    await SecureStore.setItemAsync(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Fail soft — these are best-effort local stores.
  }
}
