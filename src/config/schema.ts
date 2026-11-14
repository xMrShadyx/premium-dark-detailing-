import { z } from "zod";

/**
 * Schemas for all editable business content (SRS §8).
 * Config files are the single source of business data; these schemas
 * make invalid configuration fail fast in development, tests and build.
 */

export const LANGUAGES = ["bg", "en"] as const;
export const languageSchema = z.enum(LANGUAGES);

const nonEmpty = z.string().trim().min(1);

export const localizedTextSchema = z.object({
  bg: nonEmpty,
  en: nonEmpty,
});

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^(https?:\/\/|viber:\/\/|tel:|mailto:)/.test(v), {
    message: "Must be empty or an absolute URL",
  });

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\+?[0-9\s\-()]{6,20}$/.test(v), {
    message: "Must be empty or a phone number such as +359 88 123 4567",
  });

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: "Must be empty or a valid email address",
  });

export const workingHoursSchema = z.object({
  days: localizedTextSchema,
  hours: localizedTextSchema,
});

export const siteConfigSchema = z.object({
  /** Empty string = no business name. The UI must not render a placeholder. */
  businessName: z.string().trim(),
  /** Path to a logo in /public, or null. */
  logo: z.string().trim().min(1).nullable(),
  /** Absolute production origin, e.g. https://example.bg — used for canonical URLs. */
  siteUrl: optionalUrl,
  defaultLanguage: languageSchema,
  supportedLanguages: z.array(languageSchema).min(1),
  hero: z.object({
    /** Optimized image in /public (AVIF/WebP). null = built-in abstract visual. */
    image: z.string().trim().min(1).nullable(),
    imageAlt: localizedTextSchema.nullable(),
  }),
  contact: z.object({
    phone: optionalPhone,
    email: optionalEmail,
    /** Viber phone number in international format, e.g. +359881234567. */
    viber: optionalPhone,
  }),
  location: z.object({
    city: localizedTextSchema.nullable(),
    address: localizedTextSchema.nullable(),
    mapUrl: optionalUrl,
  }),
  workingHours: z.array(workingHoursSchema),
  socialLinks: z.object({
    facebook: optionalUrl,
    instagram: optionalUrl,
  }),
});

export const priceSchema = z.object({
  amount: z.number().positive(),
  currency: z.literal("EUR"),
  type: z.enum(["fixed", "starting_from"]),
});

export const serviceSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Use kebab-case ids, e.g. interior-cleaning" }),
  title: localizedTextSchema,
  shortDescription: localizedTextSchema,
  description: localizedTextSchema,
  features: z.array(localizedTextSchema),
  image: z.string().trim().min(1).nullable(),
  price: priceSchema.nullable(),
  durationMinutes: z.number().int().positive().nullable(),
  enabled: z.boolean(),
  order: z.number().int(),
});

export const servicesSchema = z.array(serviceSchema).superRefine((services, ctx) => {
  const seen = new Set<string>();
  services.forEach((service, index) => {
    if (seen.has(service.id)) {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate service id "${service.id}"`,
        path: [index, "id"],
      });
    }
    seen.add(service.id);
  });
});

export const galleryItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Use kebab-case ids" }),
  serviceId: z.string().min(1),
  beforeImage: z.string().trim().min(1),
  afterImage: z.string().trim().min(1),
  title: localizedTextSchema,
  description: localizedTextSchema.optional(),
  /** true = digitally simulated "before"; the UI labels it so it is never read as a real result. */
  demo: z.boolean().optional(),
  published: z.boolean(),
  order: z.number().int(),
});

export const galleryItemsSchema = z.array(galleryItemSchema);

/** One line of the price list (from the M&M Garage ad). */
export const offerSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Use kebab-case ids" }),
  /** Service category used to preselect the booking form. */
  serviceId: z.string().min(1),
  icon: z.enum(["car", "van", "headlight", "headlight-coated", "package"]),
  title: localizedTextSchema,
  /** Small line under the title, e.g. "(без покритие)". */
  note: localizedTextSchema.optional(),
  /** Gift that comes with the offer, e.g. washer fluid. */
  gift: localizedTextSchema.optional(),
  price: priceSchema,
  /** Promo package: ids of the offers it bundles, for the "instead of X €" line. */
  bundles: z.array(z.string()).optional(),
  promo: z.boolean().optional(),
  enabled: z.boolean(),
  order: z.number().int(),
});
export const offersSchema = z.array(offerSchema);

export type Language = z.infer<typeof languageSchema>;
export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type Price = z.infer<typeof priceSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type WorkingHours = z.infer<typeof workingHoursSchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type Offer = z.infer<typeof offerSchema>;
