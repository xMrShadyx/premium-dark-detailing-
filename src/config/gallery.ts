import type { GalleryItem } from "./schema";

/**
 * Before/after gallery. Real results must be real photographs of the business's
 * own work (same vehicle, comparable angle and framing), never stock (SRS §5.4).
 *
 * The two entries below are DEMO material: the "before" haze was added digitally.
 * `demo: true` makes the site label them as a simulation. Replace them with real
 * before/after photos and remove `demo` once available.
 */
export const galleryItems = [
  {
    id: "headlight-demo-1",
    serviceId: "headlight-restoration",
    beforeImage: "/images/gallery/headlight-demo-1-before.webp",
    afterImage: "/images/gallery/headlight-demo-1-after.webp",
    title: { bg: "Възстановяване на фар — SUV", en: "Headlight restoration — SUV" },
    demo: true,
    published: true,
    order: 1,
  },
  {
    id: "headlight-demo-2",
    serviceId: "headlight-restoration",
    beforeImage: "/images/gallery/headlight-demo-2-before.webp",
    afterImage: "/images/gallery/headlight-demo-2-after.webp",
    title: { bg: "Възстановяване на фар — кросоувър", en: "Headlight restoration — crossover" },
    demo: true,
    published: true,
    order: 2,
  },
] satisfies GalleryItem[];
