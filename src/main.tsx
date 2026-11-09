import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "@/styles/index.css";

import { App } from "@/app/App";
import { LocaleProvider } from "@/app/providers/LocaleProvider";
import { siteConfig } from "@/config";
import { createI18n } from "@/lib/i18n";
import { BASE_PATH, resolveInitialLanguage } from "@/lib/locale";

const root = document.getElementById("root");
if (!root) throw new Error("#root element not found");

const isAdminRoute = window.location.pathname.slice(BASE_PATH.length).startsWith("admin");

if (isAdminRoute) {
  // Admin panel: a separate chunk, downloaded only on /admin/.
  void import("@/admin/main").then(({ mountAdmin }) => mountAdmin(root));
} else {
  const initialLanguage = resolveInitialLanguage(window.location.pathname, siteConfig.defaultLanguage);
  const i18n = createI18n(initialLanguage);

  createRoot(root).render(
    <StrictMode>
      <LocaleProvider i18n={i18n} initialLanguage={initialLanguage}>
        <App />
      </LocaleProvider>
    </StrictMode>,
  );
}
