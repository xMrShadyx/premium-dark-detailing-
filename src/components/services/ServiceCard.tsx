import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Clock } from "lucide-react";
import type { Service } from "@/config/schema";
import { useLocale } from "@/app/providers/LocaleProvider";
import { useInquiryIntent } from "@/features/inquiries/InquiryIntentContext";
import { formatDuration, formatPrice } from "@/lib/format";
import { assetUrl, localize } from "@/lib/locale";
import { buttonClasses } from "@/components/ui/Button";

type Props = { service: Service; index: number };

/** One generic card for every configured service — no per-service components. */
export function ServiceCard({ service, index }: Props) {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const { setServiceId } = useInquiryIntent();

  const title = localize(service.title, lang);
  const price = formatPrice(service.price, lang, t);
  const duration = formatDuration(service.durationMinutes, t);
  const titleId = `service-${service.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      data-service-id={service.id}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,background-color] duration-300 hover:border-gold/40 hover:bg-surface-hover/60 motion-reduce:transition-none"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-bg-2">
        {service.image ? (
          <img
            src={assetUrl(service.image)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          // Neutral visual until real photography is supplied.
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(80%_100%_at_100%_0%,color-mix(in_srgb,var(--color-gold)_16%,transparent)_0%,transparent_60%)]" />
            <div className="absolute inset-y-0 right-[18%] w-px rotate-[20deg] bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
          </div>
        )}
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-5 font-display text-5xl font-semibold text-fg/10 sm:text-6xl"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 id={titleId} className="text-card font-semibold text-fg">
          {title}
        </h3>
        <p className="mt-2 font-medium text-fg">{localize(service.shortDescription, lang)}</p>
        <p className="mt-3 text-fg-muted">{localize(service.description, lang)}</p>

        {service.features.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold tracking-[0.16em] text-fg-muted uppercase">
              {t("services.included")}
            </h4>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {service.features.map((feature) => (
                <li key={feature.en} className="flex items-start gap-2.5 text-sm text-fg">
                  <Check aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-gold" />
                  {localize(feature, lang)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-8">
          <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 text-sm">
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">{t("services.price")}</dt>
              <dd className="font-display text-lg font-semibold text-fg">{price}</dd>
            </div>
            {duration && (
              <div className="flex items-center gap-1.5 text-fg-muted">
                <dt>
                  <Clock aria-hidden="true" size={15} />
                  <span className="sr-only">{t("services.duration")}</span>
                </dt>
                <dd>{duration}</dd>
              </div>
            )}
          </dl>
          <a
            href="#contact"
            onClick={() => setServiceId(service.id)}
            className={buttonClasses({ variant: "secondary" }, "mt-5 w-full sm:w-auto")}
          >
            {t("services.inquire")}
            <span className="sr-only">: {title}</span>
            <ArrowRight aria-hidden="true" size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}
