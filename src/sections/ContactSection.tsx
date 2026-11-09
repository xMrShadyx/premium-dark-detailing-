import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLocale } from "@/app/providers/LocaleProvider";
import { InquiryForm } from "@/features/inquiries/InquiryForm";
import { siteConfig } from "@/config";
import { mailtoHref, telHref, viberHref } from "@/lib/contact";
import { localize } from "@/lib/locale";

type Channel = { key: string; label: string; value: string; href: string | null; icon: ReactNode };

/**
 * Contact section: inquiry form + configured channels.
 * Unconfigured channels are hidden, never shown as placeholders (SRS §5.6).
 */
export function ContactSection() {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const { contact, location, workingHours } = siteConfig;
  const icon = (Icon: typeof Phone) => <Icon aria-hidden="true" size={20} className="text-gold" />;

  const channels: Channel[] = [];
  if (contact.phone)
    channels.push({ key: "phone", label: t("contact.phone"), value: contact.phone, href: telHref(contact.phone), icon: icon(Phone) });
  if (contact.viber)
    channels.push({ key: "viber", label: t("contact.viber"), value: contact.viber, href: viberHref(contact.viber), icon: icon(MessageCircle) });
  if (contact.email)
    channels.push({ key: "email", label: t("contact.email"), value: contact.email, href: mailtoHref(contact.email), icon: icon(Mail) });
  if (location.address) {
    const address = [location.address, location.city].filter(Boolean).map((x) => localize(x!, lang)).join(", ");
    channels.push({ key: "address", label: t("contact.address"), value: address, href: location.mapUrl || null, icon: icon(MapPin) });
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-bg py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex min-w-0 flex-col gap-8">
          <SectionHeading
            id="contact-title"
            eyebrow={t("contact.eyebrow")}
            title={t("contact.title")}
            subtitle={t("contact.subtitle")}
          />

          {channels.length > 0 && (
            <ul className="grid gap-3">
              {channels.map(({ key, label, value, href, icon: channelIcon }) => {
                const body = (
                  <>
                    {channelIcon}
                    <span className="flex min-w-0 flex-col">
                      <span className="text-xs tracking-wider text-fg-muted uppercase">{label}</span>
                      <span className="break-words text-fg">{value}</span>
                    </span>
                  </>
                );
                const cls = "flex min-h-16 items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-3";
                return (
                  <li key={key}>
                    {href ? (
                      <a
                        href={href}
                        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={`${cls} transition-colors hover:border-gold/50`}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className={cls}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {workingHours.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wider text-fg-muted uppercase">
                <Clock aria-hidden="true" size={16} className="text-gold" />
                {t("contact.hours")}
              </h3>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
                {workingHours.map((row) => (
                  <div key={row.days.en} className="contents">
                    <dt className="text-fg-muted">{localize(row.days, lang)}</dt>
                    <dd className="text-fg tabular-nums">{localize(row.hours, lang)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-8">
          <InquiryForm />
        </div>
      </Container>
    </section>
  );
}
