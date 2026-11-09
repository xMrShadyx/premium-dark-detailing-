import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import type { i18n as I18n } from "i18next";
import type { Language } from "@/config/schema";
import { siteConfig } from "@/config";
import { buildLocalizedPath, parseLanguageFromPath, storeLanguage } from "@/lib/locale";
import { applyDocumentMeta } from "@/lib/seo";

type LocaleContextValue = {
  lang: Language;
  /** Navigates /bg/#x ↔ /en/#x, keeping the current section. */
  switchLanguage: (next: Language) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type Props = {
  i18n: I18n;
  initialLanguage: Language;
  children: ReactNode;
};

export function LocaleProvider({ i18n, initialLanguage, children }: Props) {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const siteUrl = import.meta.env.VITE_SITE_URL || siteConfig.siteUrl;

  // Normalise unlocalised or mismatched URLs ("/", "/foo") to "/<lang>/".
  useEffect(() => {
    const { pathname, hash } = window.location;
    if (parseLanguageFromPath(pathname) !== initialLanguage || !pathname.endsWith("/")) {
      window.history.replaceState(null, "", buildLocalizedPath(initialLanguage, hash));
    }
  }, [initialLanguage]);

  // Keep i18next and <head> in sync with the active language.
  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
    applyDocumentMeta(lang, i18n.getFixedT(lang), siteUrl);
  }, [i18n, lang, siteUrl]);

  // Browser back/forward between /bg/ and /en/.
  useEffect(() => {
    const onPopState = () => {
      const fromUrl = parseLanguageFromPath(window.location.pathname);
      if (fromUrl) setLang(fromUrl);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const switchLanguage = useCallback(
    (next: Language) => {
      if (next === lang) return;
      window.history.pushState(null, "", buildLocalizedPath(next, window.location.hash));
      storeLanguage(next);
      setLang(next);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, switchLanguage }), [lang, switchLanguage]);

  return (
    <I18nextProvider i18n={i18n}>
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </I18nextProvider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
