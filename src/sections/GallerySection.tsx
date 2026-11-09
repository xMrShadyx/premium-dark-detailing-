import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BeforeAfterSlider } from "@/components/gallery/BeforeAfterSlider";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLocale } from "@/app/providers/LocaleProvider";
import { useGalleryItems } from "@/features/gallery/useGalleryItems";
import type { GalleryItem } from "@/config/schema";
import { assetUrl, localize } from "@/lib/locale";
import { cn } from "@/lib/cn";

/**
 * "Резултати": before/after sliders in a swipeable row (two per view on wider
 * screens) with page dots, as in the mock-up. Demo items keep a small
 * "simulation" note (SRS §5.4).
 */
export function GallerySection({ items: itemsProp }: { items?: GalleryItem[] }) {
  const { t } = useTranslation();
  const remote = useGalleryItems();
  const items = itemsProp ?? remote.items;
  const loading = !itemsProp && remote.loading;
  const { lang } = useLocale();
  const trackRef = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(2);

  // Two cards per view from the `sm` breakpoint, one on phones.
  useEffect(() => {
    const media = window.matchMedia?.("(min-width: 40rem)");
    const update = () => setPerView(media?.matches === false ? 1 : 2);
    update();
    media?.addEventListener("change", update);
    return () => media?.removeEventListener("change", update);
  }, []);

  const pages = Math.max(1, Math.ceil(items.length / perView));

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setPage(Math.min(pages - 1, Math.round(track.scrollLeft / track.clientWidth)));
  };
  const goTo = (p: number) => {
    setPage(p);
    const track = trackRef.current;
    track?.scrollTo?.({ left: p * track.clientWidth, behavior: "smooth" });
  };

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="bg-bg py-12 sm:py-16">
      <Container>
        <SectionHeading id="gallery-title" eyebrow={t("gallery.eyebrow")} title={t("gallery.title")} />

        {loading ? (
          <div aria-hidden="true" className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="aspect-[2/1] animate-pulse rounded-2xl bg-surface motion-reduce:animate-none" />
            <div className="hidden aspect-[2/1] animate-pulse rounded-2xl bg-surface motion-reduce:animate-none sm:block" />
          </div>
        ) : items.length === 0 ? (
          <div className="card-glass mx-auto mt-10 max-w-lg rounded-2xl px-8 py-10 text-center">
            <p className="font-display text-lg font-semibold text-fg">{t("gallery.emptyTitle")}</p>
            <p className="mt-2 text-sm text-fg-muted">{t("gallery.emptyText")}</p>
          </div>
        ) : (
          <>
            <ul
              ref={trackRef}
              onScroll={onScroll}
              className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((item) => {
                const title = localize(item.title, lang);
                return (
                  <li key={item.id} className="relative w-full shrink-0 snap-start sm:w-[calc(50%-0.75rem)]">
                    <figure>
                      <BeforeAfterSlider
                        before={assetUrl(item.beforeImage)}
                        after={assetUrl(item.afterImage)}
                        beforeLabel={t("gallery.before")}
                        afterLabel={t("gallery.after")}
                        label={t("gallery.sliderLabel", { title })}
                        hint={t("gallery.sliderHint")}
                      />
                      <figcaption className="sr-only">{title}</figcaption>
                    </figure>
                  </li>
                );
              })}
            </ul>

            {pages > 1 && (
              <div role="group" aria-label={t("gallery.title")} className="mt-6 flex justify-center gap-2">
                {Array.from({ length: pages }, (_, p) => (
                  <button
                    key={p}
                    type="button"
                    aria-label={t("gallery.pageLabel", { from: p * perView + 1, to: Math.min(items.length, (p + 1) * perView) })}
                    aria-current={page === p ? "true" : undefined}
                    onClick={() => goTo(p)}
                    className="flex h-6 w-6 items-center justify-center"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-2.5 w-2.5 rounded-full transition-colors",
                        page === p ? "bg-accent shadow-[0_0_8px] shadow-accent" : "bg-fg/30 hover:bg-fg/60",
                      )}
                    />
                  </button>
                ))}
              </div>
            )}

            {items.some((i) => i.demo) && (
              <p className="mt-4 text-center text-xs text-fg-muted">{t("gallery.demoNote")}</p>
            )}
          </>
        )}
      </Container>
    </section>
  );
}
