import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { BeforeAfterSlider } from "@/components/gallery/BeforeAfterSlider";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLocale } from "@/app/providers/LocaleProvider";
import { getEnabledServices } from "@/config";
import { useGalleryItems } from "@/features/gallery/useGalleryItems";
import type { GalleryItem } from "@/config/schema";
import { assetUrl, localize } from "@/lib/locale";
import { cn } from "@/lib/cn";

/**
 * Before/after gallery: comparison sliders, or a designed empty state.
 * Items flagged `demo` carry a visible "simulation" label (SRS §5.4).
 */
export function GallerySection({ items: itemsProp }: { items?: GalleryItem[] }) {
  const { t } = useTranslation();
  const remote = useGalleryItems();
  const items = itemsProp ?? remote.items;
  const loading = !itemsProp && remote.loading;
  const { lang } = useLocale();
  const [filter, setFilter] = useState<string>("all");

  // One chip per enabled service that has gallery items, in service order.
  const categories = useMemo(
    () => getEnabledServices().filter((s) => items.some((i) => i.serviceId === s.id)),
    [items],
  );
  const visible = filter === "all" ? items : items.filter((i) => i.serviceId === filter);
  const chip = (active: boolean) =>
    cn(
      "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors",
      active ? "border-gold bg-gold text-bg" : "border-line text-fg-muted hover:border-gold/60 hover:text-fg",
    );

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="bg-bg-2 py-20 sm:py-28">
      <Container>
        <SectionHeading
          id="gallery-title"
          eyebrow={t("gallery.eyebrow")}
          title={t("gallery.title")}
          subtitle={items.length > 0 ? t("gallery.subtitle") : undefined}
        />

        {loading ? (
          <div aria-hidden="true" className="mt-12 grid max-w-5xl gap-8 sm:grid-cols-2">
            <div className="aspect-[3/4] animate-pulse rounded-2xl bg-surface motion-reduce:animate-none" />
            <div className="hidden aspect-[3/4] animate-pulse rounded-2xl bg-surface motion-reduce:animate-none sm:block" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 grid overflow-hidden rounded-2xl border border-line sm:grid-cols-[1fr_auto_1fr]">
            <div aria-hidden="true" className="relative hidden h-44 bg-[repeating-linear-gradient(135deg,var(--color-surface)_0_10px,var(--color-bg-2)_10px_20px)] sm:block">
              <span className="absolute top-4 left-4 text-xs font-semibold tracking-[0.2em] text-fg-muted uppercase">
                {t("gallery.before")}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 bg-surface px-8 py-10 text-center sm:max-w-sm">
              <p className="font-display text-lg font-semibold text-fg">{t("gallery.emptyTitle")}</p>
              <p className="text-sm text-fg-muted">{t("gallery.emptyText")}</p>
            </div>
            <div aria-hidden="true" className="relative hidden h-44 bg-[radial-gradient(80%_120%_at_100%_0%,color-mix(in_srgb,var(--color-gold)_22%,transparent)_0%,var(--color-bg-2)_70%)] sm:block">
              <span className="absolute top-4 right-4 text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                {t("gallery.after")}
              </span>
            </div>
          </div>
        ) : (
          <>
            {items.some((i) => i.demo) && (
              <p className="mt-8 flex max-w-3xl items-start gap-2.5 rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-fg">
                <Info aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-gold" />
                {t("gallery.demoNote")}
              </p>
            )}
            {categories.length > 1 && (
              <div role="group" aria-label={t("gallery.filterLabel")} className="mt-8 flex flex-wrap gap-2">
                <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={chip(filter === "all")}>
                  {t("gallery.filterAll")}
                </button>
                {categories.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={filter === s.id}
                    onClick={() => setFilter(s.id)}
                    className={chip(filter === s.id)}
                  >
                    {localize(s.title, lang)}
                  </button>
                ))}
              </div>
            )}
            <ul className="mt-8 grid max-w-5xl gap-8 sm:grid-cols-2">
              {visible.map((item) => {
                const title = localize(item.title, lang);
                return (
                  <li key={item.id}>
                    <figure className="flex flex-col gap-3">
                      <BeforeAfterSlider
                        before={assetUrl(item.beforeImage)}
                        after={assetUrl(item.afterImage)}
                        beforeLabel={t("gallery.before")}
                        afterLabel={t("gallery.after")}
                        label={t("gallery.sliderLabel", { title })}
                        hint={t("gallery.sliderHint")}
                      />
                      <figcaption className="flex flex-col gap-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-display font-semibold text-fg">{title}</span>
                          {item.demo && (
                            <span className="rounded-full border border-gold/50 px-2.5 py-0.5 text-xs font-medium text-gold">
                              {t("gallery.demoBadge")}
                            </span>
                          )}
                        </span>
                        {item.description && (
                          <span className="text-sm text-fg-muted">{localize(item.description, lang)}</span>
                        )}
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Container>
    </section>
  );
}
