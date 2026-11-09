import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLocale } from "@/app/providers/LocaleProvider";
import { getEnabledServices } from "@/config";
import type { Service } from "@/config/schema";
import { formatDuration, formatPrice } from "@/lib/format";
import { localize } from "@/lib/locale";

type Props = { services?: Service[] };

/** Price list generated from the same service config as the cards. */
export function PricingSection({ services = getEnabledServices() }: Props) {
  const { t } = useTranslation();
  const { lang } = useLocale();
  if (services.length === 0) return null;

  const showDuration = services.some((s) => s.durationMinutes !== null);

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="bg-bg-2 py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <SectionHeading
          id="pricing-title"
          eyebrow={t("pricing.eyebrow")}
          title={t("pricing.title")}
          subtitle={t("pricing.subtitle")}
        />

        <table className="w-full self-start text-left">
          <caption className="sr-only">{t("pricing.title")}</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{t("pricing.service")}</th>
              <th scope="col">{t("pricing.price")}</th>
              {showDuration && <th scope="col">{t("pricing.duration")}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-line border-y border-line">
            {services.map((service) => {
              const duration = formatDuration(service.durationMinutes, t);
              return (
                <tr
                  key={service.id}
                  className="flex flex-col gap-1 py-6 sm:table-row sm:py-0"
                >
                  <th
                    scope="row"
                    className="font-display text-lg font-medium text-fg sm:py-7 sm:pr-6"
                  >
                    {localize(service.title, lang)}
                    <span className="mt-1 block font-sans text-sm font-normal text-fg-muted">
                      {localize(service.shortDescription, lang)}
                    </span>
                  </th>
                  <td className="font-display text-lg font-semibold whitespace-nowrap text-gold sm:py-7 sm:text-right">
                    {formatPrice(service.price, lang, t)}
                  </td>
                  {showDuration && (
                    <td className="text-sm whitespace-nowrap text-fg-muted sm:py-7 sm:pl-6 sm:text-right">
                      {duration ?? ""}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Container>
    </section>
  );
}
