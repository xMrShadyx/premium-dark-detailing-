import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Navigation } from "./Navigation";
import { useLocale } from "@/app/providers/LocaleProvider";
import { getEnabledServices, hasBusinessName, siteConfig } from "@/config";
import { mailtoHref, telHref, viberHref } from "@/lib/contact";
import { assetUrl, localize } from "@/lib/locale";

const heading = "mb-4 font-display text-sm font-bold text-fg";

/** Brand-style footer from the mock-up: logo, quick links, services, contacts, social. */
export function Footer() {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const year = new Date().getFullYear();
  const { contact, socialLinks, logo, businessName } = siteConfig;

  const contacts: { key: string; href: string | null; icon: ReactNode; label: string }[] = [];
  const ic = "shrink-0 text-accent";
  if (contact.phone) contacts.push({ key: "phone", href: telHref(contact.phone), icon: <Phone aria-hidden="true" size={18} className={ic} />, label: contact.phone });
  if (contact.email) contacts.push({ key: "email", href: mailtoHref(contact.email), icon: <Mail aria-hidden="true" size={18} className={ic} />, label: contact.email });
  if (contact.viber) contacts.push({ key: "viber", href: viberHref(contact.viber), icon: <MessageCircle aria-hidden="true" size={18} className={ic} />, label: `Viber: ${contact.viber}` });

  const social = [
    { key: "facebook", href: socialLinks.facebook, label: "Facebook", path: "M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v9h4v-9h3l1-4h-4V9c0-.6.4-1 1-1Z" },
    { key: "instagram", href: socialLinks.instagram, label: "Instagram", path: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" },
  ].filter((s) => s.href);

  return (
    <footer id="about" className="bg-bg">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr_auto]">
        <div>
          {logo ? (
            <img src={assetUrl(logo)} alt={businessName} width={720} height={338} loading="lazy" className="h-28 w-auto" />
          ) : (
            hasBusinessName() && <p className="font-brand text-2xl font-extrabold italic">{businessName}</p>
          )}
        </div>

        <nav aria-label={t("a11y.footerNavigation")}>
          <h2 className={heading}>{t("footer.quickLinks")}</h2>
          <Navigation variant="footer" />
        </nav>

        <div>
          <h2 className={heading}>{t("footer.services")}</h2>
          <ul className="flex flex-col gap-2">
            {getEnabledServices().map((s) => (
              <li key={s.id}>
                <a href="#services" className="text-sm text-fg-muted transition-colors hover:text-fg">
                  {localize(s.title, lang)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {contacts.length > 0 && (
          <div>
            <h2 className={heading}>{t("footer.contact")}</h2>
            <ul className="flex flex-col gap-3">
              {contacts.map((c) => (
                <li key={c.key}>
                  <a href={c.href ?? undefined} className="flex items-center gap-3 text-sm text-fg-muted transition-colors hover:text-fg">
                    {c.icon}
                    <span className="break-all">{c.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {social.length > 0 && (
          <ul aria-label={t("footer.social")} className="flex gap-3">
            {social.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-fg transition-colors hover:border-accent hover:text-accent"
                >
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.path} fillRule="evenodd" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Container>
      <div className="border-t border-line/70">
        <Container className="py-5 text-center text-xs text-fg-muted">
          {t("footer.copyright", { year })}
          {hasBusinessName() && ` ${businessName} – ${t("footer.owners")}.`} {t("footer.rights")}
        </Container>
      </div>
    </footer>
  );
}
