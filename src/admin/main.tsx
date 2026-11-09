import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { createI18n } from "@/lib/i18n";
import { AdminApp } from "./AdminApp";

/** Entry for /admin/ — loaded on demand, never part of the public page's bundle. */
export function mountAdmin(root: HTMLElement): void {
  document.documentElement.lang = "bg";
  createRoot(root).render(
    <StrictMode>
      <I18nextProvider i18n={createI18n("bg")}>
        <AdminApp />
      </I18nextProvider>
    </StrictMode>,
  );
}
