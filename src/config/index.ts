import type { z } from "zod";
import {
  galleryItemsSchema,
  siteConfigSchema,
  servicesSchema,
  type GalleryItem,
  type Service,
  type SiteConfig,
} from "./schema";
import { siteConfig as rawSite } from "./site";
import { services as rawServices } from "./services";
import { galleryItems as rawGallery } from "./gallery";

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

export type { GalleryItem, Language, LocalizedText, Price, Service, SiteConfig } from "./schema";
