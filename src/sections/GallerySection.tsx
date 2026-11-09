import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageOff } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLocale } from "@/app/providers/LocaleProvider";
import { getPublishedGallery } from "@/config";
import type { GalleryItem } from "@/config/schema";
import { assetUrl, localize } from "@/lib/locale";

/** One photo; a missing file shows a neutral tile instead of a broken image (SRS §5.4). */
function Photo({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="relative aspect-[4/3] overflow-hidden rounded-xl bg-bg-2">
      {failed ? (
        <div className="flex h-full items-center justify-center text-fg-muted">
          <ImageOff aria-hidden="true" size={28} />
        </div>
      ) : (
        <img
          src={assetUrl(src)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
      <figcaption className="absolute top-3 left-3 rounded-full bg-bg/80 px-3 py-1 text-xs font-semibold tracking-wider text-fg uppercase">
        {label}
      </figcaption>
    </figure>
  );
}

/**
 * Before/after gallery. Sprint 1: pairs side by side, or a designed empty state.
 * The draggable comparison slider and full-screen viewer arrive in Sprint 3.
 */
export function GallerySection({ items = getPublishedGallery() }: { items?: GalleryItem[] }) {
  const { t } = useTranslation();
  const { lang } = useLocale();

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="bg-bg-2 py-20 sm:py-28">
      <Container>
        <SectionHeading
          id="gallery-title"
          eyebrow={t("gallery.eyebrow")}
          title={t("gallery.title")}
          subtitle={items.length > 0 ? t("gallery.subtitle") : undefined}
        />

        {items.length === 0 ? (
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
          <ul className="mt-12 grid gap-8 lg:grid-cols-2">
            {items.map((item) => (
              <li key={item.id}>
                <article aria-labelledby={`gallery-${item.id}`} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Photo src={item.beforeImage} label={t("gallery.before")} />
                    <Photo src={item.afterImage} label={t("gallery.after")} />
                  </div>
                  <h3 id={`gallery-${item.id}`} className="font-display font-semibold text-fg">
                    {localize(item.title, lang)}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-fg-muted">{localize(item.description, lang)}</p>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
