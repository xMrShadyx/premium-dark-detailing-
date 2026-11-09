import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/app/providers/LocaleProvider";
import { siteConfig } from "@/config";
import type { Language } from "@/config/schema";
import { buildLocalizedPath } from "@/lib/locale";
import { cn } from "@/lib/cn";

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
      <ul className="flex items-center rounded-full border border-line p-0.5">
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
                  "flex h-9 min-w-10 items-center justify-center rounded-full px-2.5 text-xs font-semibold tracking-wider uppercase transition-colors",
                  active ? "bg-surface-hover text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {code}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
