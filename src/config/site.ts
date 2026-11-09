import type { SiteConfig } from "./schema";

/**
 * Site-wide business configuration.
 *
 * ⚠️ Illustrative values only — not finalized production data (SRS §8.1).
 * Empty strings / null mean "not configured": the UI hides these fields
 * instead of showing placeholders.
 */
export const siteConfig = {
  businessName: "MM Detailing",
  logo: "/images/brand/mm-mark.webp",
  siteUrl: "",

  defaultLanguage: "bg",
  supportedLanguages: ["bg", "en"],

  hero: {
    // Illustration placeholder — replace with a real photo (AVIF/WebP) when available.
    image: "/images/hero/hero-car.svg",
    imageAlt: {
      bg: "Илюстрация на автомобил в студио",
      en: "Illustration of a car in a studio",
    },
  },

  contact: {
    phone: "",
    email: "",
    viber: "",
  },

  location: {
    city: null,
    address: null,
    mapUrl: "",
  },

  workingHours: [],

  socialLinks: {
    facebook: "",
    instagram: "",
  },
} satisfies SiteConfig;
