import { useTranslation } from "react-i18next";
import { CalendarDays, Mail, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button, buttonClasses } from "@/components/ui/Button";
import { siteConfig } from "@/config";
import { useInquiryIntent } from "@/features/inquiries/InquiryIntentContext";
import { mailtoHref, telHref, viberHref } from "@/lib/contact";
import { assetUrl } from "@/lib/locale";
import { cn } from "@/lib/cn";

/**
 * Booking call-to-action band from the mock-up: car photo, headline and the
 * contact buttons. Viber / email / phone appear only when configured (SRS §5.6);
 * "book online" (the inquiry form) is always there.
 */
export function ContactSection() {
  const { t } = useTranslation();
  const { openBooking } = useInquiryIntent();
  const { contact } = siteConfig;
  const btn = "h-13 min-w-48 px-6 text-base";

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative isolate overflow-hidden border-y border-accent/20 bg-bg-2"
    >
      <div aria-hidden="true" className="absolute inset-y-0 left-0 -z-10 hidden w-[38%] md:block">
        <img src={assetUrl("/images/site/cta-car.webp")} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bg-2/30 to-bg-2" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(60%_120%_at_70%_0%,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent_70%)]"
      />

      <Container className="py-12 md:py-14 md:!pl-[40%]">
        <div className="flex items-start gap-5">
          <CalendarDays aria-hidden="true" size={52} strokeWidth={1.6} className="shrink-0 text-accent text-glow max-sm:hidden" />
          <div>
            <h2 id="contact-title" className="font-display text-2xl font-extrabold text-fg sm:text-3xl">
              {t("cta.title")}
            </h2>
            <p className="mt-3 max-w-md text-fg/85">{t("cta.text")}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button onClick={() => openBooking()} className={btn}>
            <CalendarDays aria-hidden="true" size={20} />
            {t("cta.online")}
          </Button>
          {contact.viber && (
            <a
              href={viberHref(contact.viber) ?? undefined}
              className={buttonClasses(
                {},
                cn(btn, "bg-none bg-[#7360f2] shadow-[0_6px_24px_-4px] shadow-[#7360f2]/70 hover:bg-[#8474ff]"),
              )}
            >
              <MessageCircle aria-hidden="true" size={20} />
              {t("cta.viber")}
            </a>
          )}
          {contact.email && (
            <a href={mailtoHref(contact.email) ?? undefined} className={buttonClasses({ variant: "outline" }, btn)}>
              <Mail aria-hidden="true" size={20} className="text-accent" />
              {t("cta.email")}
            </a>
          )}
          {contact.phone && (
            <a href={telHref(contact.phone) ?? undefined} className={buttonClasses({}, cn(btn, "tabular-nums"))}>
              <Phone aria-hidden="true" size={20} />
              {contact.phone}
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}
