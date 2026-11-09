import type { TFunction } from "i18next";
import { LANGUAGES, type Language } from "@/config/schema";
import { BASE_PATH, LOCALE_TAGS } from "./locale";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Client-side localized metadata (SRS §2.3). Phase 5 prerendering will emit
 * the same tags into static HTML; this keeps them correct during SPA navigation.
 */
export function applyDocumentMeta(lang: Language, t: TFunction, siteUrl: string): void {
  const origin = (siteUrl || window.location.origin + BASE_PATH).replace(/\/$/, "");
  const title = t("meta.title");
  const description = t("meta.description");

  document.documentElement.lang = lang;
  document.title = title;
  upsertMeta("name", "description", description);

  upsertLink("canonical", `${origin}/${lang}/`);
  for (const alt of LANGUAGES) upsertLink("alternate", `${origin}/${alt}/`, alt);
  upsertLink("alternate", `${origin}/bg/`, "x-default");

  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", `${origin}/${lang}/`);
  upsertMeta("property", "og:locale", LOCALE_TAGS[lang].replace("-", "_"));
}
