/**
 * Page section registry. Navigation is generated from this list, so a link
 * never points to a section that is not rendered.
 *
 * #about is the footer's brand block until an About section exists.
 */
export const SECTION_IDS = {
  home: "home",
  services: "services",
  pricing: "pricing",
  gallery: "gallery",
  about: "about",
  contact: "contact",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

/** Sections shown in the header / mobile menu / footer, in order. */
export const navigationSections: SectionId[] = ["home", "services", "pricing", "gallery", "about", "contact"];
