import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { LocaleProvider } from "@/app/providers/LocaleProvider";
import { InquiryIntentProvider } from "@/features/inquiries/InquiryIntentContext";
import type { Language } from "@/config/schema";
import { createI18n } from "@/lib/i18n";

export function renderWithProviders(ui: ReactElement, { lang = "bg" as Language, hash = "" } = {}) {
  window.history.replaceState(null, "", `/${lang}/${hash}`);
  const i18n = createI18n(lang);
  return {
    i18n,
    ...render(
      <LocaleProvider i18n={i18n} initialLanguage={lang}>
        <InquiryIntentProvider>{ui}</InquiryIntentProvider>
      </LocaleProvider>,
    ),
  };
}
