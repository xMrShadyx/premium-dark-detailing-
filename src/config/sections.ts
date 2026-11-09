/**
 * Page section registry. Navigation is generated from this list, so a link
 * never points to a section that is not rendered.
 *
 * About (#about) is added here when implemented.
 */
export const SECTION_IDS = {
  home: "home",
  services: "services",
  pricing: "pricing",
  gallery: "gallery",
  contact: "contact",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

/** Sections shown in the header / mobile menu / footer, in order. */
export const navigationSections: SectionId[] = ["services", "pricing", "gallery", "contact"];
