import { create } from "zustand";
import { loadLocalJSON, saveLocalJSON } from "./localPersistence";

/**
 * Local app preferences: language + currency (demo). Persisted so the choice
 * survives restarts. Reflected on the Profile screen and the settings screen.
 */

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur", label: "Urdu" },
  { code: "ar", label: "Arabic" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
] as const;

export const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "PKR", label: "Pakistani Rupee", symbol: "₨" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

const KEY = "settings.v1";

interface SettingsState {
  language: LanguageCode;
  currency: CurrencyCode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (language: LanguageCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: "en",
  currency: "USD",
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    const saved = await loadLocalJSON<{ language?: LanguageCode; currency?: CurrencyCode }>(KEY);
    if (saved?.language) set({ language: saved.language });
    if (saved?.currency) set({ currency: saved.currency });
    set({ hydrated: true });
  },

  setLanguage: (language) => set({ language }),
  setCurrency: (currency) => set({ currency }),
}));

void useSettingsStore.getState().hydrate();
useSettingsStore.subscribe((s) => {
  void saveLocalJSON(KEY, { language: s.language, currency: s.currency });
});
