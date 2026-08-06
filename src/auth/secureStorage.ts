import * as SecureStore from "expo-secure-store";

/**
 * Secure token storage wrapper (Keychain/Keystore via expo-secure-store).
 * Session tokens must never live in plain AsyncStorage.
 */
const SESSION_KEY = "travelnest.session.v1";

export const secureStorage = {
  async saveSession(json: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(SESSION_KEY, json);
    } catch (e) {
      // SecureStore is unavailable in Expo Go on some platforms; fail soft.
      console.warn("secureStorage.saveSession failed", e);
    }
  },

  async loadSession(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(SESSION_KEY);
    } catch (e) {
      console.warn("secureStorage.loadSession failed", e);
      return null;
    }
  },

  async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } catch (e) {
      console.warn("secureStorage.clearSession failed", e);
    }
  },
};
