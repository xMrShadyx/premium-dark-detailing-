import { LANGUAGES, type Language, type LocalizedText } from "@/config/schema";

export const STORAGE_KEY = "preferred-language";

/** Deploy base path, e.g. "/" locally or "/premium-dark-detailing-/" on GitHub Pages. */
export const BASE_PATH: string = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");

/** BCP 47 tags used for Intl formatting and Open Graph. */
export const LOCALE_TAGS: Record<Language, string> = {
  bg: "bg-BG",
  en: "en-GB",
};

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

/** "<base>en/" → "en", "<base>bg" → "bg", "<base>" → null */
export function parseLanguageFromPath(pathname: string): Language | null {
  const rest = pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname;
  const first = rest.split("/").filter(Boolean)[0];
  return isLanguage(first) ? first : null;
}

/** buildLocalizedPath("en", "#gallery") → "<base>en/#gallery" */
export function buildLocalizedPath(lang: Language, hash = ""): string {
  const safeHash = /^#[A-Za-z][\w-]*$/.test(hash) ? hash : "";
  return `${BASE_PATH}${lang}/${safeHash}`;
}

/** Resolves a file in /public against the deploy base: "/images/a.svg" → "<base>images/a.svg". */
export function assetUrl(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return BASE_PATH + path.replace(/^\//, "");
}

export function readStoredLanguage(): Language | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeLanguage(lang: Language): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage unavailable (private mode) — persistence is best-effort */
  }
}

/** URL wins; otherwise the remembered choice; otherwise the configured default. */
export function resolveInitialLanguage(pathname: string, fallback: Language): Language {
  return parseLanguageFromPath(pathname) ?? readStoredLanguage() ?? fallback;
}

export function localize(text: LocalizedText, lang: Language): string {
  return text[lang];
}
