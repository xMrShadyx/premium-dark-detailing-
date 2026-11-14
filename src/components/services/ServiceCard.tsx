import { useTranslation } from "react-i18next";
import { ArrowRight, Check } from "lucide-react";
import type { Service } from "@/config/schema";
import { useLocale } from "@/app/providers/LocaleProvider";
import { useInquiryIntent } from "@/features/inquiries/InquiryIntentContext";
import { assetUrl, localize } from "@/lib/locale";
import { formatPrice } from "@/lib/format";
import { ServiceIcon } from "./ServiceIcon";

type Props = { service: Service };

/** Service card from the mock-up: photo, icon + title, checklist and an arrow that books the service. */
export function ServiceCard({ service }: Props) {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const { openBooking } = useInquiryIntent();

  const title = localize(service.title, lang);
  const titleId = `service-${service.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      data-service-id={service.id}
      className="card-glass group relative flex flex-col overflow-hidden rounded-2xl transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_-8px] hover:shadow-accent/60 motion-reduce:transition-none"
    >
      <div className="relative h-36 overflow-hidden sm:h-40">
        {service.image && (
          <img
            src={assetUrl(service.image)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg-2 via-bg-2/30 to-transparent" />
      </div>

      <div className="relative -mt-6 flex flex-1 items-end gap-4 px-6 pb-6 sm:px-7">
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="flex items-center gap-4 text-card font-extrabold text-fg">
            <ServiceIcon id={service.id} size={44} className="shrink-0 text-accent text-glow" />
            {title}
          </h3>
          {service.price && (
            <a href="#pricing" className="mt-2 inline-block text-sm font-bold text-accent hover:underline">
              {formatPrice(service.price, lang, t)}
            </a>
          )}
          {service.features.length > 0 && (
            <ul className="mt-5 grid gap-2">
              {service.features.map((feature) => (
                <li key={feature.en} className="flex items-start gap-3 text-sm text-fg/90">
                  <Check aria-hidden="true" size={18} strokeWidth={3} className="mt-0.5 shrink-0 text-accent" />
                  {localize(feature, lang)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={() => openBooking(service.id)}
          aria-label={`${t("services.inquire")}: ${title}`}
          className="mb-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/70 text-accent transition-colors hover:bg-accent hover:text-white"
        >
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </div>
    </article>
  );
}
