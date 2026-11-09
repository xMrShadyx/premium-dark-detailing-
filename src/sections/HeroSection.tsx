import { useTranslation } from "react-i18next";
import { CalendarDays, Clock, Play, ShieldCheck, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useLocale } from "@/app/providers/LocaleProvider";
import { siteConfig } from "@/config";
import { useInquiryIntent } from "@/features/inquiries/InquiryIntentContext";
import { assetUrl, localize } from "@/lib/locale";

/** Hero from the brand mock-up: copy on the left, glowing headlight photo on the right. */
export function HeroSection() {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const { openBooking } = useInquiryIntent();
  const { image, imageAlt } = siteConfig.hero;

  const badges = [
    { icon: ShieldCheck, label: t("hero.badgeQuality") },
    { icon: Clock, label: t("hero.badgeFast") },
    { icon: Star, label: t("hero.badgeVisible") },
  ];

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden border-b border-accent/15 bg-bg pt-24 lg:pt-28"
    >
      {image && (
        <div className="absolute inset-y-0 right-0 -z-10 w-full sm:w-[62%] lg:w-[55%]">
          {/* Likely LCP element: eager + high priority, never lazy (SRS §10). */}
          <img
            src={assetUrl(image)}
            alt={imageAlt ? localize(imageAlt, lang) : ""}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover object-left"
          />
          {/* Blend the photo into the navy page on its left and bottom edges. */}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-bg via-bg/40 to-transparent" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
          <div aria-hidden="true" className="absolute inset-0 bg-bg/60 sm:hidden" />
        </div>
      )}

      <Container className="pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-2xl animate-rise">
          <p className="mb-5 text-xs font-semibold tracking-[0.45em] text-fg uppercase sm:text-sm">
            {t("hero.eyebrow")}
          </p>
          <h1 id="hero-title" className="font-brand text-[clamp(2.4rem,1.4rem+3.6vw,4rem)] leading-[1.08] font-extrabold italic tracking-tight text-fg">
            {t("hero.title")}
            <span className="block text-accent text-glow">{t("hero.titleAccent")}</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-fg/90">{t("hero.description")}</p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Button onClick={() => openBooking()} className="min-w-44">
              <CalendarDays aria-hidden="true" size={19} />
              {t("hero.primaryButton")}
            </Button>
            <ButtonLink href="#gallery" variant="secondary" className="min-w-44">
              <Play aria-hidden="true" size={17} className="text-accent" />
              {t("hero.secondaryButton")}
            </ButtonLink>
          </div>

          <ul aria-label={t("hero.highlights")} className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-fg/90">
            {badges.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5">
                <Icon aria-hidden="true" size={22} className="text-accent" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
