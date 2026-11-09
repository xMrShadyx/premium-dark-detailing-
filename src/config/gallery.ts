import type { GalleryItem } from "./schema";

/**
 * Before/after gallery. Only real photographs of the business's own work
 * (same vehicle, comparable angle and framing). Never stock images (SRS §5.4).
 *
 * Example entry:
 * {
 *   id: "octavia-seats",
 *   serviceId: "interior-cleaning",
 *   beforeImage: "/images/gallery/octavia-seats-before.webp",
 *   afterImage: "/images/gallery/octavia-seats-after.webp",
 *   title: { bg: "Пране на седалки", en: "Seat cleaning" },
 *   published: true,
 *   order: 1,
 * }
 */
export const galleryItems = [] satisfies GalleryItem[];
