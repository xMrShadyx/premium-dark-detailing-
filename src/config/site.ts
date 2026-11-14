import type { SiteConfig } from "./schema";

/**
 * Site-wide business configuration.
 *
 * ⚠️ Illustrative values only — not finalized production data (SRS §8.1).
 * Empty strings / null mean "not configured": the UI hides these fields
 * instead of showing placeholders.
 */
export const siteConfig = {
  businessName: "M&M Garage",
  logo: "/images/brand/mm-garage-logo-hq.webp",
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
    phone: "0888 189 352",
    email: "",
    viber: "",
  },

  location: {
    city: { bg: "Варна", en: "Varna" },
    address: null,
    mapUrl: "",
  },

  workingHours: [],

  socialLinks: {
    facebook: "",
    instagram: "",
  },
} satisfies SiteConfig;
