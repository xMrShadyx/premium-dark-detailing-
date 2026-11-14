import { useTranslation } from "react-i18next";
import { CalendarDays, Gift, Phone, Tag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { OfferIcon } from "@/components/pricing/OfferIcon";
import { useLocale } from "@/app/providers/LocaleProvider";
import { allOffers, bundleValue, getEnabledOffers, siteConfig } from "@/config";
import type { Offer } from "@/config/schema";
import { useInquiryIntent } from "@/features/inquiries/InquiryIntentContext";
import { telHref } from "@/lib/contact";
import { formatCurrency } from "@/lib/format";
import { localize } from "@/lib/locale";
import { cn } from "@/lib/cn";

/** Slanted shapes from the ad: numbered badge on the left, price tag on the right. */
const SLANT = "[clip-path:polygon(14%_0,100%_0,86%_100%,0_100%)]";

/** Price list in the style of the M&M Garage ad: numbered rows, price tags, highlighted promo package. */
export function PricingSection({ offers = getEnabledOffers() }: { offers?: Offer[] }) {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const { openBooking } = useInquiryIntent();
  if (offers.length === 0) return null;

  const regular = offers.filter((o) => !o.promo);
  const promos = offers.filter((o) => o.promo);
  const price = (o: Offer) => formatCurrency(o.price.amount, o.price.currency, lang);
  const titleOf = (o: Offer) => localize(o.title, lang) + (o.note && !o.promo ? ` (${localize(o.note, lang)})` : "");
  const book = (o: Offer) => openBooking(o.serviceId, `${titleOf(o)} – ${price(o)}`);
  const phone = siteConfig.contact.phone;
  const tel = telHref(phone);

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="relative isolate overflow-hidden bg-bg-2 py-16 sm:py-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_85%_0%,color-mix(in_srgb,var(--color-accent)_12%,transparent),transparent_70%)]"
      />
      <Container className="max-w-5xl">
        <SectionHeading id="pricing-title" eyebrow={t("pricing.eyebrow")} title={t("pricing.title")} />

        <ol className="mt-10 flex flex-col gap-3">
          {regular.map((offer, index) => (
            <li
              key={offer.id}
              className="card-glass grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 rounded-xl py-3 pr-3 pl-0 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-x-5 sm:py-4"
            >
              <span
                aria-hidden="true"
                className={cn(
                  SLANT,
                  "-ml-px flex h-12 w-14 items-center justify-center bg-gradient-to-b from-[#12a092] to-[#086157] font-brand text-2xl font-extrabold text-white italic sm:h-14 sm:w-16 sm:text-3xl",
                )}
              >
                {index + 1}
              </span>

              <div className="min-w-0">
                <h3 className="font-display text-base leading-snug font-extrabold text-fg uppercase sm:text-lg">
                  {localize(offer.title, lang)}
                  {offer.note && (
                    <span className="block text-sm font-semibold text-fg-muted normal-case sm:text-base">
                      ({localize(offer.note, lang)})
                    </span>
                  )}
                </h3>
                {offer.gift && (
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-fg/85">
                    <Gift aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-accent" />
                    <span>
                      <strong className="font-bold text-accent">{t("pricing.gift")}:</strong> {localize(offer.gift, lang)}
                    </span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => book(offer)}
                  className="mt-1.5 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  <CalendarDays aria-hidden="true" size={15} />
                  {t("pricing.book")}
                  <span className="sr-only">: {titleOf(offer)}</span>
                </button>
              </div>

              <OfferIcon icon={offer.icon} size={48} className="hidden text-fg/90 sm:block" />

              <p
                className={cn(
                  SLANT,
                  "flex h-14 min-w-24 items-center justify-center bg-surface-hover px-6 font-brand text-2xl font-extrabold text-fg tabular-nums ring-1 ring-accent/40 ring-inset sm:h-16 sm:min-w-32 sm:text-4xl",
                )}
              >
                <span className="sr-only">{t("pricing.price")}: </span>
                {price(offer)}
              </p>
            </li>
          ))}
        </ol>

        {promos.map((offer) => {
          const separate = bundleValue(offer, allOffers);
          const bundled = (offer.bundles ?? []).map((id) => allOffers.find((o) => o.id === id)).filter((o): o is Offer => !!o);
          return (
            <article
              key={offer.id}
              aria-labelledby={`offer-${offer.id}`}
              className="relative mt-6 grid gap-6 overflow-hidden rounded-2xl border border-accent/50 bg-surface p-5 shadow-[0_0_40px_-12px] shadow-accent/60 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            >
              <div className="min-w-0">
                <h3 id={`offer-${offer.id}`} className="flex items-center gap-3 font-brand text-2xl font-extrabold text-fg uppercase italic sm:text-3xl">
                  <span
                    aria-hidden="true"
                    className={cn(SLANT, "flex h-11 w-12 items-center justify-center bg-gradient-to-b from-[#12a092] to-[#086157] text-white")}
                  >
                    {regular.length + 1}
                  </span>
                  {localize(offer.title, lang)}
                </h3>
                {offer.note && <p className="mt-3 text-fg/90">{localize(offer.note, lang)}</p>}
                {offer.gift && (
                  <p className="mt-1 flex items-start gap-1.5 text-fg/90">
                    <Gift aria-hidden="true" size={17} className="mt-1 shrink-0 text-accent" />
                    <span>
                      {localize(offer.gift, lang)} <strong className="font-bold text-accent uppercase">{t("pricing.gift")}</strong>
                    </span>
                  </p>
                )}
                <ul aria-label={t("pricing.includes")} className="mt-5 flex flex-wrap items-center gap-3 text-accent">
                  {bundled.map((o, i) => (
                    <li key={o.id} className="flex items-center gap-3">
                      {i > 0 && <span aria-hidden="true" className="text-2xl font-bold">+</span>}
                      <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-accent/40 bg-bg-2" title={titleOf(o)}>
                        <OfferIcon icon={o.icon} size={34} className="text-fg" />
                        <span className="sr-only">{titleOf(o)}</span>
                      </span>
                    </li>
                  ))}
                  {offer.gift && (
                    <li className="flex items-center gap-3">
                      <span aria-hidden="true" className="text-2xl font-bold">+</span>
                      <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-accent/40 bg-bg-2" title={localize(offer.gift, lang)}>
                        <Gift aria-hidden="true" size={28} className="text-fg" />
                        <span className="sr-only">{localize(offer.gift, lang)}</span>
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <p className={cn(SLANT, "bg-gradient-to-b from-[#12a092] to-[#086157] px-10 py-3 text-white md:text-right")}>
                  <span className="block text-sm font-extrabold tracking-[0.2em] uppercase">{t("pricing.promo")}</span>
                  <span className="block font-brand text-5xl font-extrabold italic tabular-nums sm:text-6xl">{price(offer)}</span>
                </p>
                {separate !== null && separate > offer.price.amount && (
                  <p className="flex items-center gap-2 text-sm text-fg/90">
                    <Tag aria-hidden="true" size={16} className="text-accent" />
                    {t("pricing.instead", { price: formatCurrency(separate, offer.price.currency, lang) })}
                  </p>
                )}
                <Button onClick={() => book(offer)}>
                  <CalendarDays aria-hidden="true" size={18} />
                  {t("pricing.bookPromo")}
                </Button>
              </div>
            </article>
          );
        })}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-2xl border border-accent/40 px-5 py-4">
          <p className="font-brand text-xl font-extrabold text-fg uppercase italic">{t("pricing.bookNow")}</p>
          <Button variant="outline" onClick={() => openBooking()}>
            <CalendarDays aria-hidden="true" size={18} className="text-accent" />
            {t("pricing.online")}
          </Button>
          {tel && (
            <a href={tel} className="inline-flex min-h-11 items-center gap-2 font-brand text-2xl font-extrabold text-fg tabular-nums hover:text-accent">
              <Phone aria-hidden="true" size={22} className="text-accent" />
              {phone}
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}
