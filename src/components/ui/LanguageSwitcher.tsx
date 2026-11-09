import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/app/providers/LocaleProvider";
import { siteConfig } from "@/config";
import type { Language } from "@/config/schema";
import { buildLocalizedPath } from "@/lib/locale";
import { cn } from "@/lib/cn";

/** Small flag icons (inline SVG — emoji flags do not render on Windows). */
function Flag({ code }: { code: Language }) {
  if (code === "bg") {
    return (
      <svg aria-hidden="true" width="20" height="14" viewBox="0 0 20 14" className="rounded-[2px]">
        <rect width="20" height="14" fill="#d62612" />
        <rect width="20" height="9.33" fill="#00966e" />
        <rect width="20" height="4.67" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width="20" height="14" viewBox="0 0 60 42" className="rounded-[2px]">
      <rect width="60" height="42" fill="#012169" />
      <path d="M0 0l60 42M60 0L0 42" stroke="#fff" strokeWidth="8" />
      <path d="M0 0l60 42M60 0L0 42" stroke="#c8102e" strokeWidth="3" />
      <path d="M30 0v42M0 21h60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0v42M0 21h60" stroke="#c8102e" strokeWidth="7" />
    </svg>
  );
}

/**
 * BG / EN switcher. Real links (crawlable, work without JS); with JS the
 * switch is instant and keeps the current #section.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { lang, switchLanguage } = useLocale();

  const onClick = (event: MouseEvent<HTMLAnchorElement>, next: Language) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    switchLanguage(next);
  };

  return (
    <nav aria-label={t("a11y.languageSwitcher")} className={className}>
      <ul className="flex items-center gap-2">
        {siteConfig.supportedLanguages.map((code) => {
          const active = code === lang;
          return (
            <li key={code}>
              <a
                href={buildLocalizedPath(code)}
                hrefLang={code}
                lang={code}
                aria-current={active ? "true" : undefined}
                title={t(`languages.${code}`)}
                onClick={(e) => onClick(e, code)}
                className={cn(
                  "flex h-9 items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-bold tracking-wider uppercase transition-colors",
                  active
                    ? "border-accent bg-accent/10 text-fg shadow-[0_0_10px_-2px] shadow-accent"
                    : "border-line bg-surface/60 text-fg-muted hover:border-accent/60 hover:text-fg",
                )}
              >
                <Flag code={code} />
                {code}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
