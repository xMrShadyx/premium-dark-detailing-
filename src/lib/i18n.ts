import i18next, { type i18n as I18n } from "i18next";
import { initReactI18next } from "react-i18next";
import bg from "@/locales/bg.json";
import en from "@/locales/en.json";
import { LANGUAGES, type Language } from "@/config/schema";

export const resources = {
  bg: { translation: bg },
  en: { translation: en },
} as const;

const isDev = import.meta.env.DEV;

/**
 * Creates a configured i18next instance. In development there is no fallback
 * language, so a missing key renders as the raw key and is logged — missing
 * translations are visible immediately (SRS §7.3).
 */
export function createI18n(lng: Language): I18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng,
    supportedLngs: [...LANGUAGES],
    fallbackLng: isDev ? false : "bg",
    interpolation: { escapeValue: false },
    initAsync: false,
    saveMissing: isDev,
    missingKeyHandler: (lngs, _ns, key) => {
      console.error(`[i18n] Missing translation "${key}" for: ${[...lngs].join(", ")}`);
    },
  });
  return instance;
}
