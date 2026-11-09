import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Container";
import { Navigation } from "./Navigation";
import { hasBusinessName, siteConfig } from "@/config";

/** Neutral, service-focused footer; the business name appears only if configured. */
export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-bg">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <p className="max-w-sm text-sm text-fg-muted">{t("footer.tagline")}</p>
        <nav aria-label={t("a11y.footerNavigation")}>
          <Navigation variant="footer" />
        </nav>
      </Container>
      <Container className="border-t border-line/60 py-6">
        <p className="text-xs text-fg-muted">
          {t("footer.copyright", { year })}
          {hasBusinessName() && ` ${siteConfig.businessName}`}
        </p>
      </Container>
    </footer>
  );
}
