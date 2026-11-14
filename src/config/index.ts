import type { z } from "zod";
import {
  galleryItemsSchema,
  offersSchema,
  siteConfigSchema,
  servicesSchema,
  type GalleryItem,
  type Offer,
  type Service,
  type SiteConfig,
} from "./schema";
import { siteConfig as rawSite } from "./site";
import { services as rawServices } from "./services";
import { galleryItems as rawGallery } from "./gallery";
import { offers as rawOffers } from "./pricing";

function formatIssues(name: string, error: z.ZodError): string {
  const lines = error.issues.map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  return `Invalid ${name} configuration:\n${lines.join("\n")}`;
}

export function parseSiteConfig(input: unknown): SiteConfig {
  const result = siteConfigSchema.safeParse(input);
  if (!result.success) throw new Error(formatIssues("site", result.error));
  return result.data;
}

export function parseServices(input: unknown): Service[] {
  const result = servicesSchema.safeParse(input);
  if (!result.success) throw new Error(formatIssues("services", result.error));
  return result.data;
}

export function parseGallery(input: unknown, services: Service[]): GalleryItem[] {
  const result = galleryItemsSchema.safeParse(input);
  if (!result.success) throw new Error(formatIssues("gallery", result.error));
  const ids = new Set(services.map((s) => s.id));
  for (const item of result.data) {
    if (!ids.has(item.serviceId)) {
      throw new Error(`Invalid gallery configuration:\n  • ${item.id}.serviceId: unknown service "${item.serviceId}"`);
    }
  }
  return result.data;
}

/** Validated at module load: invalid config breaks dev, tests and `npm run build`. */
export const siteConfig: SiteConfig = parseSiteConfig(rawSite);
export const allServices: Service[] = parseServices(rawServices);
export const allGalleryItems: GalleryItem[] = parseGallery(rawGallery, allServices);

export function parseOffers(input: unknown, services: Service[]): Offer[] {
  const result = offersSchema.safeParse(input);
  if (!result.success) throw new Error(formatIssues("pricing", result.error));
  const serviceIds = new Set(services.map((s) => s.id));
  const offerIds = new Set(result.data.map((o) => o.id));
  for (const offer of result.data) {
    if (!serviceIds.has(offer.serviceId)) {
      throw new Error(`Invalid pricing configuration:\n  • ${offer.id}.serviceId: unknown service "${offer.serviceId}"`);
    }
    for (const id of offer.bundles ?? []) {
      if (!offerIds.has(id)) throw new Error(`Invalid pricing configuration:\n  • ${offer.id}.bundles: unknown offer "${id}"`);
    }
  }
  return result.data;
}

export const allOffers: Offer[] = parseOffers(rawOffers, allServices);

export function getEnabledOffers(list: Offer[] = allOffers): Offer[] {
  return list.filter((o) => o.enabled).sort((a, b) => a.order - b.order);
}

/** Sum of the separate prices of the offers a package bundles (null if none). */
export function bundleValue(offer: Offer, list: Offer[] = allOffers): number | null {
  if (!offer.bundles?.length) return null;
  return offer.bundles.reduce((sum, id) => sum + (list.find((o) => o.id === id)?.price.amount ?? 0), 0);
}

export function getPublishedGallery(list: GalleryItem[] = allGalleryItems): GalleryItem[] {
  return list.filter((g) => g.published).sort((a, b) => a.order - b.order);
}

export function getEnabledServices(list: Service[] = allServices): Service[] {
  return list.filter((s) => s.enabled).sort((a, b) => a.order - b.order);
}

export function getServiceById(id: string, list: Service[] = allServices): Service | undefined {
  return list.find((s) => s.id === id);
}

export function hasBusinessName(config: SiteConfig = siteConfig): boolean {
  return config.businessName.trim().length > 0;
}

export type { GalleryItem, Language, LocalizedText, Offer, Price, Service, SiteConfig } from "./schema";
