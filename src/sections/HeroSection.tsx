import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/app/providers/LocaleProvider";
import { siteConfig } from "@/config";
import { assetUrl, localize } from "@/lib/locale";

/**
 * Abstract "polished surface" visual used until a real photograph is configured.
 * Pure CSS/SVG: no network request, no fabricated imagery, no LCP penalty.
 */
function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_85%_10%,#2a2620_0%,transparent_55%),radial-gradient(90%_70%_at_0%_100%,#17171b_0%,transparent_60%)]" />
      {/* reflection streaks, like light on a freshly polished panel */}
      <div className="absolute -top-1/4 right-[-10%] h-[150%] w-[55%] rotate-[18deg] bg-gradient-to-l from-transparent via-white/[0.035] to-transparent" />
      <div className="absolute -top-1/4 right-[12%] h-[150%] w-[6%] rotate-[18deg] bg-gradient-to-l from-transparent via-gold/[0.07] to-transparent" />
      <svg
        className="absolute inset-x-0 bottom-0 h-[55%] w-full text-line opacity-60"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        fill="none"
      >
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M0 ${400 - i * 22} C 300 ${330 - i * 26}, 900 ${330 - i * 26}, 1200 ${400 - i * 22}`}
            stroke="currentColor"
            strokeWidth="1"
            opacity={1 - i * 0.1}
          />
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const { image, imageAlt } = siteConfig.hero;

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="theme-dark relative isolate flex min-h-[88svh] bg-bg items-end overflow-hidden pt-28 pb-16 sm:items-center sm:pb-24 lg:min-h-[92svh]"
    >
      {image ? (
        <>
          {/* Likely LCP element: eager + high priority, never lazy (SRS §10). */}
          <img
            src={assetUrl(image)}
            alt={imageAlt ? localize(imageAlt, lang) : ""}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full object-cover object-[72%_center]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/80 to-bg/30"
          />
        </>
      ) : (
        <div className="absolute inset-0 -z-10">
          <HeroBackdrop />
        </div>
      )}

      <Container>
        <div className="max-w-3xl animate-rise">
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold tracking-[0.24em] text-gold sm:text-sm">
            <span aria-hidden="true" className="h-px w-10 bg-gold/70" />
            {t("hero.eyebrow")}
          </p>
          <h1 id="hero-title" className="text-hero font-semibold text-fg">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-fg-muted sm:text-xl">{t("hero.description")}</p>
          <div className="mt-10 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <ButtonLink href="#contact" className="group">
              {t("hero.primaryButton")}
              <ArrowRight
                aria-hidden="true"
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </ButtonLink>
            <ButtonLink href="#services" variant="secondary">
              {t("hero.secondaryButton")}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
