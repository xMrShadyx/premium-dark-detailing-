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
  logo: "/images/brand/mm-logo-lockup.webp",
  siteUrl: "",

  defaultLanguage: "bg",
  supportedLanguages: ["bg", "en"],

  hero: {
    // From the design mock-up — replace with a real photo (AVIF/WebP) when available.
    image: "/images/site/hero-headlight.webp",
    imageAlt: {
      bg: "Светещ LED фар на тъмен автомобил",
      en: "Glowing LED headlight of a dark car",
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
